import { useState, useEffect } from "react";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function SkillsAdmin() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    level: 80,
    icon: null, // this will hold the file object when uploading
    display_order: 0,
  });
  const [currentIconUrl, setCurrentIconUrl] = useState(""); // to show preview of existing image
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const toast = useToast();

  const CATEGORIES = ["Programming", "Framework", "AI/ML", "Web", "IoT", "Tools"];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get("/skills/");
      setSkills(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSkill(null);
    setFormData({
      name: "",
      category: "Programming",
      level: 80,
      icon: null,
      display_order: 0,
    });
    setCurrentIconUrl("");
    setIsCustomCategory(false);
    setModalOpen(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    const standard = CATEGORIES.includes(skill.category);
    setFormData({
      name: skill.name || "",
      category: skill.category || "Programming",
      level: skill.level || 80,
      icon: null, // Don't carry over the string URL to file input
      display_order: skill.display_order || 0,
    });
    // If backend returns icon URL, store it separately for preview
    setCurrentIconUrl(skill.icon || "");
    setIsCustomCategory(!standard);
    setModalOpen(true);
  };

  const handleDelete = async (skill) => {
    if (!confirm(`Delete skill "${skill.name}"?`)) return;

    try {
      await api.delete(`/skills/${skill.id}/`);
      toast.success("Skill deleted successfully");
      fetchSkills();
    } catch (error) {
      toast.error("Failed to delete skill");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("category", formData.category);
      form.append("level", formData.level);
      form.append("display_order", formData.display_order);
      if (formData.icon) {
        form.append("icon", formData.icon);
      }

      if (editingSkill) {
        await api.patch(`/skills/${editingSkill.id}/`, form);
        toast.success("Skill updated successfully");
      } else {
        await api.post("/skills/", form);
        toast.success("Skill created successfully");
      }
      setModalOpen(false);
      fetchSkills();
    } catch (error) {
      toast.error(editingSkill ? "Failed to update skill" : "Failed to create skill");
      setLoading(false);
    }
  };

  const columns = [
    {
      label: "Name",
      field: "name",
      render: (row) => <span className="font-medium text-white">{row.name}</span>,
    },
    {
      label: "Category",
      field: "category",
    },
    {
      label: "Level",
      field: "level",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              style={{ width: `${row.level}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">{row.level}%</span>
        </div>
      ),
    },
    {
      label: "Order",
      field: "display_order",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Skills</h1>
          <p className="text-gray-400">Manage your technical skills</p>
        </div>
        <GlowButton onClick={handleAdd}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </GlowButton>
      </div>

      <DataTable
        columns={columns}
        data={skills}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? "Edit Skill" : "Add New Skill"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skill Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <div className="space-y-2">
                <select
                value={isCustomCategory || !CATEGORIES.includes(formData.category) ? "Other" : formData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Other") {
                    setIsCustomCategory(true);
                    setFormData({ ...formData, category: "" });
                  } else {
                    setIsCustomCategory(false);
                    setFormData({ ...formData, category: val });
                  }
                }}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter custom category"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent animate-in fade-in slide-in-from-top-2 duration-200"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proficiency Level ({formData.level}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Skill Icon / Logo</label>
              <div className="flex items-start gap-4">
                {(currentIconUrl || formData.icon) && (
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shrink-0">
                    <img
                      src={formData.icon ? URL.createObjectURL(formData.icon) : currentIconUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <label className="flex-1">
                  <div className="w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/10 hover:border-cyan-500/50 transition-colors">
                    <span className="text-gray-400 text-sm">
                      {formData.icon ? formData.icon.name : "Click to upload image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormData({ ...formData, icon: e.target.files[0] });
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Ideally a transparent PNG or SVG logo.</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <GlowButton type="submit">
              {editingSkill ? "Update" : "Create"} Skill
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
