import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";
import { ContactIcon, ICON_OPTIONS, getPlatformColors } from "../../components/ContactIcons";
import ImageUploader from "../components/ImageUploader";

const EMPTY_FORM = {
  title: "",
  link: "",
  icon_type: "gmail",
  image_opacity: 0.2,
  display_order: 0,
  is_active: true,
};

/* ── Live preview card ── */
function ProfilePreview({ form, imageSrc }) {
  const [clrA, clrB] = getPlatformColors(form.icon_type);
  return (
    <div className="flex justify-center py-4">
      <div className="relative w-32 h-32 group">
        {/* Thin ring — always spinning, shown via opacity in preview */}
        <div className="absolute -inset-[2px] rounded-full overflow-hidden opacity-100">
          <motion.div
            className="w-full h-full rounded-full"
            style={{ background: `conic-gradient(from 0deg, ${clrA}, ${clrB}, transparent 60%, ${clrA})` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {/* Card — dark interior */}
        <div className="relative w-full h-full rounded-full overflow-hidden border border-white/[0.06] flex flex-col items-center justify-center"
          style={{ background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.04), rgba(5,7,15,0.85))" }}
        >
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-10"
            style={{ background: `linear-gradient(to bottom right, ${clrA}, ${clrB})` }}
          />
          {/* Watermark image */}
          {imageSrc && (
            <img
              src={imageSrc}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: parseFloat(form.image_opacity) || 0.2, filter: "grayscale(20%) brightness(0.8)" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          {/* Icon + title */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="mb-1 text-white">
              <ContactIcon iconType={form.icon_type} size="h-10 w-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {form.title || "Title"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactProfileAdmin() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const toast = useToast();

  const handleImageChange = (file) => {
    setProfileImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const res = await api.get("/contact-profiles/");
      setProfiles(res.data.results || res.data);
    } catch {
      toast.error("Failed to fetch contact profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProfile(null);
    setFormData(EMPTY_FORM);
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setExistingImageUrl(null);
    setModalOpen(true);
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      title: profile.title || "",
      link: profile.link || "",
      icon_type: profile.icon_type || "gmail",
      image_opacity: profile.image_opacity ?? 0.2,
      display_order: profile.display_order || 0,
      is_active: profile.is_active !== false,
    });
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setExistingImageUrl(profile.profile_image_url || null);
    setModalOpen(true);
  };

  const handleDelete = async (profile) => {
    if (!confirm(`Delete "${profile.title}"?`)) return;
    try {
      await api.delete(`/contact-profiles/${profile.id}/`);
      toast.success("Contact profile deleted");
      fetchProfiles();
    } catch {
      toast.error("Failed to delete contact profile");
    }
  };

  const handleToggleActive = async (profile) => {
    try {
      await api.patch(`/contact-profiles/${profile.id}/`, { is_active: !profile.is_active });
      toast.success(`Profile ${profile.is_active ? "hidden" : "shown"}`);
      fetchProfiles();
    } catch {
      toast.error("Failed to toggle visibility");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (profileImageFile) data.append("profile_image", profileImageFile);
      if (editingProfile) {
        await api.patch(`/contact-profiles/${editingProfile.id}/`, data);
        toast.success("Contact profile updated");
      } else {
        await api.post("/contact-profiles/", data);
        toast.success("Contact profile created");
      }
      setModalOpen(false);
      fetchProfiles();
    } catch {
      toast.error(editingProfile ? "Failed to update profile" : "Failed to create profile");
    }
  };

  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const columns = [
    {
      label: "Preview",
      field: "icon_type",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
            <ContactIcon iconType={row.icon_type} size="h-6 w-6" />
          </div>
        </div>
      ),
    },
    {
      label: "Title",
      field: "title",
      render: (row) => <span className="font-medium text-white">{row.title}</span>,
    },
    {
      label: "Type",
      field: "icon_type",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300 capitalize">{row.icon_type}</span>
      ),
    },
    {
      label: "Link",
      field: "link",
      render: (row) => (
        <a href={row.link} target="_blank" rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 text-sm truncate max-w-[180px] block"
        >
          {row.link}
        </a>
      ),
    },
    {
      label: "Opacity",
      field: "image_opacity",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${(row.image_opacity ?? 0.2) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400">{Math.round((row.image_opacity ?? 0.2) * 100)}%</span>
        </div>
      ),
    },
    {
      label: "Order",
      field: "display_order",
    },
    {
      label: "Visible",
      field: "is_active",
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            row.is_active
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
          }`}
        >
          {row.is_active ? "Visible" : "Hidden"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Contact Profiles</h1>
          <p className="text-gray-400">Manage the social media cards shown on your Contact page</p>
        </div>
        <GlowButton onClick={handleAdd}>+ Add Profile</GlowButton>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: profiles.length, color: "from-cyan-500 to-blue-500" },
          { label: "Visible", value: profiles.filter((p) => p.is_active).length, color: "from-emerald-500 to-teal-500" },
          { label: "Hidden", value: profiles.filter((p) => !p.is_active).length, color: "from-gray-500 to-gray-600" },
          { label: "Ordered", value: profiles.reduce((max, p) => Math.max(max, p.display_order || 0), 0), color: "from-purple-500 to-indigo-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">{s.label}</p>
            <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        title="All Contact Profiles"
        columns={columns}
        data={profiles}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No contact profiles yet. Add your first one!"
      />

      {/* Add / Edit Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProfile ? "Edit Contact Profile" : "Add Contact Profile"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Preview */}
        <ProfilePreview form={formData} imageSrc={profileImagePreview || existingImageUrl} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Gmail, GitHub, LinkedIn"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Icon Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Icon Type</label>
            <select
              value={formData.icon_type}
              onChange={(e) => set("icon_type", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0b0f19]">{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Link */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Link / URL</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://... or mailto:... or tel:..."
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Profile image watermark upload */}
          <div className="md:col-span-2">
            <ImageUploader
              value={existingImageUrl}
              onChange={handleImageChange}
              label="Profile Image (watermark)"
            />
          </div>

          {/* Opacity slider */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Opacity —{" "}
              <span className="text-cyan-400 font-bold">{Math.round((formData.image_opacity ?? 0.2) * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={formData.image_opacity ?? 0.2}
              onChange={(e) => set("image_opacity", parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (invisible)</span>
              <span>50%</span>
              <span>100% (full)</span>
            </div>
          </div>

          {/* Display order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => set("display_order", parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Is active toggle */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              onClick={() => set("is_active", !formData.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_active ? "bg-cyan-500" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-300">
              {formData.is_active ? "Visible on Contact page" : "Hidden from Contact page"}
            </span>
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
            {editingProfile ? "Update" : "Save"} Profile
          </GlowButton>
        </div>
        </form>
      </FormModal>
    </div>
  );
}
