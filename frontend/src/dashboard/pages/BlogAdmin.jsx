import { useState, useEffect } from "react";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ImageUploader from "../components/ImageUploader";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "AI",
    is_published: false,
    featured: false,
    read_time: 5,
  });
  const [image, setImage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get("/blog/");
      setBlogs(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      category: "AI",
      is_published: false,
      featured: false,
      read_time: 5,
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      category: blog.category || "AI",
      is_published: blog.is_published || false,
      featured: blog.featured || false,
      read_time: blog.read_time || 5,
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleDelete = async (blog) => {
    if (!confirm(`Delete blog post "${blog.title}"?`)) return;

    try {
      await api.delete(`/blog/${blog.id}/`);
      toast.success("Blog post deleted successfully");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to delete blog post");
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
      if (editingBlog) {
        await api.patch(`/blog/${editingBlog.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog post updated successfully");
      } else {
        await api.post("/blog/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Blog post created successfully");
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (error) {
      toast.error(editingBlog ? "Failed to update blog post" : "Failed to create blog post");
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
            <p className="text-xs text-gray-500">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Published",
      field: "is_published",
      render: (row) => (
        <span className={row.is_published ? "text-emerald-400" : "text-gray-500"}>
          {row.is_published ? "✓ Published" : "Draft"}
        </span>
      ),
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
      label: "Read Time",
      field: "read_time",
      render: (row) => `${row.read_time} min`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blog Posts</h1>
          <p className="text-gray-400">Manage your blog content</p>
        </div>
        <GlowButton onClick={handleAdd}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Blog Post
        </GlowButton>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent font-mono text-sm"
                placeholder="Write your blog content here (Markdown supported)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                <option value="AI">AI</option>
                <option value="ML">Machine Learning</option>
                <option value="Tech">Technology</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Read Time (minutes)</label>
              <input
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>

            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                Featured
              </label>
            </div>

            <div className="col-span-2">
              <ImageUploader value={image} onChange={setImage} label="Blog Thumbnail" />
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
              {editingBlog ? "Update" : "Create"} Post
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
