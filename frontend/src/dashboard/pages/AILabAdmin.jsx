import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import GlowButton from "../../components/GlowButton";
import { useToast } from "../components/ToastContext";

export default function AILabAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    details: "",
    experiment_title: "",
    model_name: "",
    dataset_name: "",
    accuracy: "",
    precision: "",
    recall: "",
    f1_score: "",
    status: "active",
    performance_notes: "",
  });
  const [image, setImage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/ai-lab/");
      setProjects(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch AI/ML projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      link: "",
      details: "",
      experiment_title: "",
      model_name: "",
      dataset_name: "",
      accuracy: "",
      precision: "",
      recall: "",
      f1_score: "",
      status: "active",
      performance_notes: "",
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      link: project.link || "",
      details: project.details || "",
      experiment_title: project.experiment_title || "",
      model_name: project.model_name || "",
      dataset_name: project.dataset_name || "",
      accuracy: project.accuracy || "",
      precision: project.precision || "",
      recall: project.recall || "",
      f1_score: project.f1_score || "",
      status: project.status || "active",
      performance_notes: project.performance_notes || "",
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (!confirm(`Delete "${project.title}"?`)) return;

    try {
      await api.delete(`/ai-lab/${project.id}/`);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("link", formData.link);
    data.append("details", formData.details);
    data.append("experiment_title", formData.experiment_title);
    data.append("model_name", formData.model_name);
    data.append("dataset_name", formData.dataset_name);
    data.append("status", formData.status);
    data.append("performance_notes", formData.performance_notes);

    if (formData.accuracy) data.append("accuracy", formData.accuracy);
    if (formData.precision) data.append("precision", formData.precision);
    if (formData.recall) data.append("recall", formData.recall);
    if (formData.f1_score) data.append("f1_score", formData.f1_score);
    if (image) data.append("confusion_matrix_image", image);

    try {
      if (editingProject) {
        await api.patch(`/ai-lab/${editingProject.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated successfully");
      } else {
        await api.post("/ai-lab/", data, {
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

  const columns = [
    {
      label: "Title",
      field: "title",
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.title}</p>
          {row.model_name && (
            <p className="text-xs text-gray-400 mt-1">Model: {row.model_name}</p>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      field: "status",
      render: (row) => {
        const colors = {
          active: "bg-emerald-500/20 text-emerald-400",
          paused: "bg-amber-500/20 text-amber-400",
          completed: "bg-blue-500/20 text-blue-400",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
          </span>
        );
      },
    },
    {
      label: "Accuracy",
      field: "accuracy",
      render: (row) => (
        row.accuracy ? (
          <span className={`font-bold ${
            row.accuracy >= 0.9 ? "text-emerald-400" :
            row.accuracy >= 0.7 ? "text-cyan-400" :
            "text-amber-400"
          }`}>
            {(row.accuracy * 100).toFixed(1)}%
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      label: "Dataset",
      field: "dataset_name",
      render: (row) => (
        <p className="text-gray-400 text-sm">{row.dataset_name || "-"}</p>
      ),
    },
    {
      label: "Created",
      field: "created_at",
      render: (row) => (
        <p className="text-gray-400 text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI/ML Lab</h1>
          <p className="text-gray-400">Manage AI/ML projects and experiments</p>
        </div>
        <GlowButton onClick={handleAdd}>
          <span className="mr-2">+</span>
          Add Project
        </GlowButton>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? "Edit AI/ML Project" : "Add New Project"}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4">
          {/* Required Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="Project title"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Link
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Details
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="Project description and details"
            />
          </div>

          {/* Optional Experiment Fields */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Experiment Details (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="e.g., ResNet-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dataset
                </label>
                <input
                  type="text"
                  value={formData.dataset_name}
                  onChange={(e) => setFormData({ ...formData, dataset_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="e.g., ImageNet"
                />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Performance Metrics (0.0 to 1.0)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accuracy
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.accuracy}
                  onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="0.95"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precision
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.precision}
                  onChange={(e) => setFormData({ ...formData, precision: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="0.92"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recall
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.recall}
                  onChange={(e) => setFormData({ ...formData, recall: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="0.88"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  F1 Score
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.f1_score}
                  onChange={(e) => setFormData({ ...formData, f1_score: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="0.90"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Confusion Matrix Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confusion Matrix Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
            />
          </div>

          {/* Performance Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Performance Notes
            </label>
            <textarea
              value={formData.performance_notes}
              onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              placeholder="Additional notes about model performance..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="flex-1 px-6 py-2 text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            {editingProject ? "Update" : "Create"} Project
          </button>
        </div>
      </FormModal>
    </div>
  );
}
