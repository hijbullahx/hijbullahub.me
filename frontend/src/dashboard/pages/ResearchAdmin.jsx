import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function ResearchAdmin() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    contributors: "",
    abstract: "",
    methodology: "",
    technologies: "",
    paper_link: "",
    pdf_upload: null,
    status: "planning",
    future_scope: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      const response = await api.get("/research/");
      setResearch(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch research papers");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingResearch(null);
    setFormData({
      title: "",
      contributors: "",
      abstract: "",
      methodology: "",
      technologies: "",
      paper_link: "",
      pdf_upload: null,
      status: "planning",
      future_scope: "",
    });
    setPdfFile(null);
    setModalOpen(true);
  };

  const handleEdit = (paper) => {
    setEditingResearch(paper);
    setFormData({
      title: paper.title || "",
      contributors: paper.contributors || "",
      abstract: paper.abstract || "",
      methodology: paper.methodology || "",
      technologies: paper.technologies || "",
      paper_link: paper.paper_link || "",
      pdf_upload: paper.pdf_upload || null,
      status: paper.status || "planning",
      future_scope: paper.future_scope || "",
    });
    setPdfFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (paper) => {
    if (!confirm(`Delete research paper "${paper.title}"?`)) return;

    try {
      await api.delete(`/research/${paper.id}/`);
      toast.success("Research paper deleted successfully");
      fetchResearch();
    } catch (error) {
      toast.error("Failed to delete research paper");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "pdf_upload" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (pdfFile) {
        data.append("pdf_upload", pdfFile);
      }

      if (editingResearch) {
        await api.put(`/research/${editingResearch.id}/`, data);
        toast.success("Research paper updated successfully");
      } else {
        await api.post("/research/", data);
        toast.success("Research paper created successfully");
      }

      setModalOpen(false);
      fetchResearch();
    } catch (error) {
      toast.error("Failed to save research paper");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      label: "Title",
      field: "title",
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.title}</p>
          {row.contributors && (
            <p className="text-xs text-gray-500">Contributors: {row.contributors}</p>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      field: "status",
      render: (row) => {
        const colors = {
          planning: "bg-gray-500/20 text-gray-400",
          active: "bg-amber-500/20 text-amber-400",
          published: "bg-emerald-500/20 text-emerald-400",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
          </span>
        );
      },
    },
    {
      label: "Published",
      field: "published",
      render: (row) => (
        <span className={row.status === "published" ? "text-emerald-400" : "text-gray-500"}>
          {row.status === "published" ? "✓" : "—"}
        </span>
      ),
    },
    {
      label: "Paper Link",
      field: "paper_link",
      render: (row) => (
        row.paper_link ? (
          <a 
            href={row.paper_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline text-xs"
          >
            View
          </a>
        ) : (
          <span className="text-gray-500 text-xs">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Research Papers</h1>
          <p className="text-gray-400">Manage your research publications</p>
        </div>
        <GlowButton onClick={handleAdd}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Research Paper
        </GlowButton>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={research}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResearch ? "Edit Research Paper" : "Add New Research Paper"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Research paper title"
              />
            </div>

            {/* Contributors */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Contributors</label>
              <input
                type="text"
                value={formData.contributors}
                onChange={(e) => setFormData({ ...formData, contributors: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="John Doe, Jane Smith, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of contributors</p>
            </div>

            {/* Abstract */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Abstract</label>
              <textarea
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Brief summary of the research"
              />
            </div>

            {/* Methodology */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Methodology</label>
              <textarea
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Research methodology and approach"
              />
            </div>

            {/* Technologies */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
              <textarea
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Technologies and tools used"
              />
            </div>

            {/* Future Scope */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Future Scope</label>
              <textarea
                value={formData.future_scope}
                onChange={(e) => setFormData({ ...formData, future_scope: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Future research directions"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Published checkbox indicator */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.status === "published"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "published" : "planning" })}
                  className="w-4 h-4 rounded border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                <label className="text-gray-300">Mark as Published</label>
              </div>
            </div>

            {/* Paper Link - shown when published */}
            {formData.status === "published" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paper Link
                </label>
                <input
                  type="url"
                  value={formData.paper_link}
                  onChange={(e) => setFormData({ ...formData, paper_link: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="https://doi.org/... or journal link"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Link to published paper</p>
              </div>
            )}

            {/* PDF Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">PDF Upload</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
              />
              {formData.pdf_upload && !pdfFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Current file: <a href={formData.pdf_upload} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View PDF</a>
                </p>
              )}
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
              {editingResearch ? "Update" : "Create"} Research Paper
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
