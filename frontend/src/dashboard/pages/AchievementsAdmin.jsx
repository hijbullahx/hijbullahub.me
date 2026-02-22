import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";
import ImageUploader from "../components/ImageUploader";

const EMPTY_FORM = {
  title: "",
  issuer: "",
  date: "",
  certificate_link: "",
};

export default function AchievementsAdmin() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [badgeFile, setBadgeFile] = useState(null);
  const [existingBadgeUrl, setExistingBadgeUrl] = useState(null);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/achievements/");
      setAchievements(data.results ?? data);
    } catch {
      toast.error("Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setBadgeFile(null);
    setExistingBadgeUrl(null);
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setFormData({
      title: a.title || "",
      issuer: a.issuer || "",
      date: a.date || "",
      certificate_link: a.certificate_link || "",
    });
    setBadgeFile(null);
    setExistingBadgeUrl(a.badge_image_url || null);
    setModalOpen(true);
  };

  const handleDelete = async (a) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    try {
      await api.delete(`/achievements/${a.id}/`);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Title is required."); return; }
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) data.append(k, v); });
      if (badgeFile) data.append("badge_image", badgeFile);
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editing) {
        await api.patch(`/achievements/${editing.id}/`, data, cfg);
        toast.success("Updated.");
      } else {
        await api.post("/achievements/", data, cfg);
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
      label: "Badge",
      field: "badge_image_url",
      render: (row) =>
        row.badge_image_url ? (
          <img src={row.badge_image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center text-lg">
            🏆
          </div>
        ),
    },
    {
      label: "Title",
      field: "title",
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.title}</p>
          {row.issuer && <p className="text-xs text-gray-400">{row.issuer}</p>}
        </div>
      ),
    },
    {
      label: "Date",
      field: "date",
      render: (row) => <span className="text-sm text-gray-300">{row.date || "—"}</span>,
    },
    {
      label: "Certificate",
      field: "certificate_link",
      render: (row) =>
        row.certificate_link ? (
          <a href={row.certificate_link} target="_blank" rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline">
            View ↗
          </a>
        ) : <span className="text-gray-600 text-xs">—</span>,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <p className="text-gray-400 mt-1">Manage awards, certifications &amp; accolades.</p>
        </div>
        <GlowButton onClick={openAdd}>+ Add Achievement</GlowButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">{achievements.length}</p>
          </div>
          <span className="text-3xl">🏆</span>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={achievements} loading={loading} emptyMessage="No achievements yet. Add your first one!" />

      {/* Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Achievement" : "Add Achievement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">

            {/* Title — required */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Issuer <span className="text-gray-500 text-xs">(optional)</span></label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => set("issuer", e.target.value)}
                placeholder="e.g. Amazon Web Services"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date <span className="text-gray-500 text-xs">(optional)</span></label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Certificate link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Certificate Link <span className="text-gray-500 text-xs">(optional)</span></label>
              <input
                type="url"
                value={formData.certificate_link}
                onChange={(e) => set("certificate_link", e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
              />
            </div>

            {/* Badge image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Badge Image <span className="text-gray-500 text-xs">(optional)</span></label>
              {existingBadgeUrl && !badgeFile && (
                <div className="mb-2 flex items-center gap-3">
                  <img src={existingBadgeUrl} alt="current" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  <span className="text-xs text-gray-400">Current badge</span>
                </div>
              )}
              <ImageUploader value={null} onChange={(file) => setBadgeFile(file)} label="Upload badge image" />
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
              {editing ? "Update Achievement" : "Save Achievement"}
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
