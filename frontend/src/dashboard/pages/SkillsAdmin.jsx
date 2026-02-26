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
    icon: "",
    display_order: 0,
  });
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
      icon: "",
      display_order: 0,
    });
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
      icon: skill.icon || "",
      display_order: skill.display_order || 0,
    });
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

    try {
      if (editingSkill) {
        await api.patch(`/skills/${editingSkill.id}/`, formData);
        toast.success("Skill updated successfully");
      } else {
        await api.post("/skills/", formData);
        toast.success("Skill created successfully");
      }
      setModalOpen(false);
      fetchSkills();
    } catch (error) {
      toast.error(editingSkill ? "Failed to update skill" : "Failed to create skill");
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
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icon (Optional)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="fa-python, devicon-react-original, etc."
              />
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
