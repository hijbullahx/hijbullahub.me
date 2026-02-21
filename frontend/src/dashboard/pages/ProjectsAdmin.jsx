import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ImageUploader from "../components/ImageUploader";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    full_description: "",
    github_link: "",
    live_link: "",
    demo_video_url: "",
    status: "in_progress",
    featured: false,
    display_order: 0,
  });
  const [image, setImage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      slug: "",
      short_description: "",
      full_description: "",
      github_link: "",
      live_link: "",
      demo_video_url: "",
      status: "in_progress",
      featured: false,
      display_order: 0,
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      slug: project.slug || "",
      short_description: project.short_description || "",
      full_description: project.full_description || "",
      github_link: project.github_link || "",
      live_link: project.live_link || "",
      demo_video_url: project.demo_video_url || "",
      status: project.status || "in_progress",
      featured: project.featured || false,
      display_order: project.display_order || 0,
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (!confirm(`Delete project "${project.title}"?`)) return;

    try {
      await api.delete(`/projects/${project.id}/`);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (image) {
      data.append("thumbnail", image);
    }

    try {
      if (editingProject) {
        await api.patch(`/projects/${editingProject.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated successfully");
      } else {
        await api.post("/projects/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project created successfully");
      }
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const columns = [
    {
      label: "Title",
      field: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnail && (
            <img src={row.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <p className="font-medium text-white">{row.title}</p>
            <p className="text-xs text-gray-500">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Status",
      field: "status",
      render: (row) => {
        const colors = {
          completed: "bg-emerald-500/20 text-emerald-400",
          in_progress: "bg-cyan-500/20 text-cyan-400",
          planned: "bg-amber-500/20 text-amber-400",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {row.status?.replace("_", " ")}
          </span>
        );
      },
    },
    {
      label: "Featured",
      field: "featured",
      render: (row) => (
        <span className={row.featured ? "text-emerald-400" : "text-gray-500"}>
          {row.featured ? "✓" : "—"}
        </span>
      ),
    },
    {
      label: "Order",
      field: "display_order",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your portfolio projects</p>
        </div>
        <GlowButton onClick={handleAdd}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </GlowButton>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? "Edit Project" : "Add New Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
              <textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
              <textarea
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Link</label>
              <input
                type="url"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Live Link</label>
              <input
                type="url"
                value={formData.live_link}
                onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Demo Video URL</label>
              <input
                type="url"
                value={formData.demo_video_url}
                onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
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

            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                Featured Project
              </label>
            </div>

            <div className="col-span-2">
              <ImageUploader value={image} onChange={setImage} label="Project Thumbnail" />
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
              {editingProject ? "Update" : "Create"} Project
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
