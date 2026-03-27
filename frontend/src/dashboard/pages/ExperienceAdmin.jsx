import { useState, useEffect } from "react";
import { Reorder, motion } from "framer-motion";
import api from "../../api/client";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";
import ImageUploader from "../components/ImageUploader";

const EMPTY_FORM = {
  role: "",
  organization: "",
  duration: "",
  description: "",
  highlight: false,
};

export default function ExperienceAdmin() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/experience/");
      const items = data.results ?? data;
      // Ensure sorted by display_order
      const sortedItems = [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setExperiences(sortedItems);
    } catch {
      toast.error("Failed to load experience.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const handleReorder = (newOrder) => {
    setExperiences(newOrder);
  };

  const saveOrder = async () => {
    try {
      const updates = experiences.map((item, index) => 
        api.patch(`/experience/${item.id}/`, { display_order: index })
      );
      await Promise.all(updates);
    } catch {
      toast.error("Failed to save order.");
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setLogoFile(null);
    setExistingLogoUrl(null);
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setFormData({
      role: exp.role || "",
      organization: exp.organization || "",
      duration: exp.duration || "",
      description: exp.description || "",
      highlight: exp.highlight || false,
    });
    setLogoFile(null);
    setExistingLogoUrl(exp.logo_url || null);
    setModalOpen(true);
  };

  const handleDelete = async (exp) => {
    if (!confirm(`Delete "${exp.role}"?`)) return;
    try {
      await api.delete(`/experience/${exp.id}/`);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim()) { toast.error("Role / Title is required."); return; }
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (logoFile) data.append("logo", logoFile);
      if (editing) {
        await api.patch(`/experience/${editing.id}/`, data);
        toast.success("Updated.");
      } else {
        await api.post("/experience/", data);
        toast.success("Created.");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Save failed.");
    }
  };

  const columns = [
    {
      label: "Logo",
      field: "logo_url",
      render: (row) =>
        row.logo_url ? (
          <img src={row.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-white text-lg">
            💼
          </div>
        ),
    },
    {
      label: "Role / Title",
      field: "role",
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.role}</p>
          {row.organization && <p className="text-xs text-gray-400">{row.organization}</p>}
        </div>
      ),
    },
    {
      label: "Duration",
      field: "duration",
      render: (row) => <span className="text-sm text-gray-300">{row.duration || "—"}</span>,
    },
    {
      label: "Highlight",
      field: "highlight",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.highlight ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-gray-500 border border-white/10"}`}>
          {row.highlight ? "⭐ Yes" : "No"}
        </span>
      ),
    },
    {
      label: "Actions",
      field: "id",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="px-3 py-1 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">Edit</button>
          <button onClick={() => handleDelete(row)} className="px-3 py-1 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">Delete</button>
        </div>
      ),
    },
  ];

  const stats = [
    { label: "Total", value: experiences.length, color: "from-cyan-500 to-blue-500", icon: "💼" },
    { label: "Highlighted", value: experiences.filter((e) => e.highlight).length, color: "from-amber-500 to-orange-500", icon: "⭐" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Experience</h1>
          <p className="text-gray-400 mt-1">Manage your work &amp; volunteer experience.</p>
        </div>
        <GlowButton onClick={openAdd}>+ Add Experience</GlowButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>{s.value}</p>
            </div>
            <span className="text-3xl">{s.icon}</span>
          </div>
        ))}
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
      ) : experiences.length === 0 ? (
         <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
           <p className="text-gray-400 text-lg">No experience entries yet. Add your first one!</p>
         </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="w-10 px-4 py-4"></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role / Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Highlight</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <Reorder.Group as="tbody" axis="y" values={experiences} onReorder={handleReorder} className="divide-y divide-white/5">
                {experiences.map((row) => (
                  <Reorder.Item 
                    key={row.id} 
                    value={row} 
                    as="tr" 
                    onDragEnd={saveOrder}
                    className="hover:bg-white/5 transition-colors"
                  >
                     <td className="px-4 py-4 text-gray-500 cursor-grab active:cursor-grabbing text-center" title="Drag to reorder">
                        <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-300">
                      {row.logo_url ? (
                        <img src={row.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-white text-lg">
                          💼
                        </div>
                      )}
                     </td>
                     <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-semibold text-white">{row.role}</p>
                          {row.organization && <p className="text-xs text-gray-400">{row.organization}</p>}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-300">
                        <span className="text-sm text-gray-300">{row.duration || "—"}</span>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-300">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.highlight ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                          {row.highlight ? "⭐ Yes" : "No"}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(row)}
                                className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                { /* Edit Icon */ }
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                { /* Delete Icon */ }
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

      {/* Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Experience" : "Add Experience"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">

            {/* Role — required */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role / Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Software Engineer at Institution"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Organization <span className="text-gray-500 text-xs">(optional)</span></label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => set("organization", e.target.value)}
                placeholder="e.g. Google"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration <span className="text-gray-500 text-xs">(optional)</span></label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. Jan 2023 – Present"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-gray-500 text-xs">(optional)</span></label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief summary of your role..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition resize-none"
              />
            </div>

            {/* Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Logo <span className="text-gray-500 text-xs">(optional)</span></label>
              {existingLogoUrl && !logoFile && (
                <div className="mb-2 flex items-center gap-3">
                  <img src={existingLogoUrl} alt="current" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  <span className="text-xs text-gray-400">Current logo</span>
                </div>
              )}
              <ImageUploader value={null} onChange={(file) => setLogoFile(file)} label="Upload logo image" />
            </div>

            {/* Highlight toggle */}
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("highlight", !formData.highlight)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${formData.highlight ? "bg-amber-500" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.highlight ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-sm text-gray-300">Mark as highlight ⭐</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition text-sm font-medium"
            >
              Cancel
            </button>
            <GlowButton type="submit" className="flex-1">
              {editing ? "Update Experience" : "Save Experience"}
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}

