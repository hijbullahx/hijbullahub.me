import { useState, useEffect } from "react";
import { Reorder, motion } from "framer-motion";
import api from "../../api/client";
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
      // Ensure skills are sorted by display_order initially
      const fetchedSkills = response.data.results || response.data;
      const sortedSkills = [...fetchedSkills].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setSkills(sortedSkills);
    } catch (error) {
      toast.error("Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newOrder) => {
    setSkills(newOrder);
  };

  const saveOrder = async () => {
    try {
      // Create updates with new indices
      const updates = skills.map((skill, index) => 
        api.patch(`/skills/${skill.id}/`, { display_order: index })
      );
      await Promise.all(updates);
      // toast.success("Order updated"); // Optional: showing too many toasts might be annoying
    } catch (error) {
      toast.error("Failed to update order");
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

      <div className="text-sm text-slate-400 italic">
        Drag items to reorder them on the homepage.
      </div>

      {loading ? (
         <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
           <div className="flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
           </div>
         </div>
      ) : skills.length === 0 ? (
         <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
           <p className="text-gray-400 text-lg">No skills added yet.</p>
         </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="w-10 px-4 py-4"></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <Reorder.Group as="tbody" axis="y" values={skills} onReorder={handleReorder} className="divide-y divide-white/5">
                {skills.map((skill) => (
                  <Reorder.Item 
                    key={skill.id} 
                    value={skill} 
                    as="tr" 
                    onDragEnd={saveOrder}
                    className="hover:bg-white/5 transition-colors"
                  >
                     <td className="px-4 py-4 text-gray-500 cursor-grab active:cursor-grabbing text-center" title="Drag to reorder">
                        <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                     </td>
                     <td className="px-6 py-4 text-sm font-medium text-white">{skill.name}</td>
                     <td className="px-6 py-4 text-sm text-gray-300">{skill.category}</td>
                     <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{skill.level}%</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-300">{skill.display_order}</td>
                     <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(skill)}
                                className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(skill)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                          </div>
                     </td>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </table>
          </div>
        </div>
      )}

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
