import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import { useToast } from "../components/ToastContext";

const RATE_LABELS = {
  hourly: "Per Hour",
  daily: "Per Day",
  task: "Per Task / Fixed",
  monthly: "Per Month",
};

const STATUS_COLORS = {
  new: "bg-cyan-500/20 text-cyan-400",
  reviewed: "bg-blue-500/20 text-blue-400",
  accepted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS = {
  new: "New",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function HireRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/hire-requests/");
      setRequests(response.data.results || response.data);
    } catch {
      toast.error("Failed to fetch hire requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      await api.post(`/hire-requests/${id}/${action}/`);
      toast.success(`Request ${action}ed`);
      fetchRequests();
      setDetailsOpen(false);
    } catch {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleDelete = async (request) => {
    if (!confirm(`Delete hire request from "${request.name}"?`)) return;
    try {
      await api.delete(`/hire-requests/${request.id}/`);
      toast.success("Request deleted");
      fetchRequests();
    } catch {
      toast.error("Failed to delete request");
    }
  };

  const newRequests = requests.filter((r) => r.status === "new");
  const reviewedRequests = requests.filter((r) => r.status === "reviewed");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  const columns = [
    {
      label: "Status",
      field: "status",
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_read && (
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse flex-shrink-0" />
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {STATUS_LABELS[row.status] || row.status}
          </span>
        </div>
      ),
    },
    {
      label: "Applicant",
      field: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      label: "Rate",
      field: "proposed_rate",
      render: (row) => (
        <div>
          <p className="text-white font-semibold">${row.proposed_rate}</p>
          <p className="text-xs text-gray-400">{RATE_LABELS[row.rate_type] || row.rate_type}</p>
        </div>
      ),
    },
    {
      label: "Duration",
      field: "duration",
      render: (row) => <span className="text-gray-300 text-sm">{row.duration}</span>,
    },
    {
      label: "Received",
      field: "created_at",
      render: (row) => (
        <p className="text-gray-400 text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </p>
      ),
    },
  ];

  const renderSection = (title, data, emoji) =>
    data.length > 0 && (
      <div key={title}>
        <h2 className="text-xl font-bold text-white mb-4">
          {emoji} {title}
        </h2>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          onEdit={(r) => { setSelectedRequest(r); setDetailsOpen(true); }}
          onDelete={handleDelete}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hire Requests</h1>
        <p className="text-gray-400">Manage freelance hire enquiries from visitors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New", value: newRequests.length, color: "text-cyan-400", emoji: "🆕" },
          { label: "Reviewed", value: reviewedRequests.length, color: "text-blue-400", emoji: "👁" },
          { label: "Accepted", value: acceptedRequests.length, color: "text-emerald-400", emoji: "✅" },
          { label: "Rejected", value: rejectedRequests.length, color: "text-red-400", emoji: "❌" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <span className="text-3xl">{s.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tables by status */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-16 text-center">
          <div className="text-6xl mb-4">💼</div>
          <p className="text-gray-400 text-lg">No hire requests yet.</p>
          <p className="text-gray-500 text-sm mt-1">They'll appear here when someone submits the Hire Me form.</p>
        </div>
      )}

      {renderSection("New Requests", newRequests, "🆕")}
      {renderSection("Reviewed", reviewedRequests, "👁")}
      {renderSection("Accepted", acceptedRequests, "✅")}
      {renderSection("Rejected", rejectedRequests, "❌")}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailsOpen && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0B0F19] border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold gradient-text">Hire Request Details</h3>
                  <button
                    onClick={() => setDetailsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Applicant */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Name</p>
                      <p className="text-white font-semibold">{selectedRequest.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                      <a
                        href={`mailto:${selectedRequest.email}`}
                        className="text-cyan-400 hover:underline"
                      >
                        {selectedRequest.email}
                      </a>
                    </div>
                  </div>

                  {/* Rate & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Proposed Rate</p>
                      <p className="text-white font-bold text-xl">
                        ${selectedRequest.proposed_rate}{" "}
                        <span className="text-sm text-gray-400 font-normal">
                          {RATE_LABELS[selectedRequest.rate_type]}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-white">{selectedRequest.duration}</p>
                    </div>
                  </div>

                  {/* Status & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[selectedRequest.status]}`}>
                        {STATUS_LABELS[selectedRequest.status]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Received</p>
                      <p className="text-white text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Work / Project Details</p>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedRequest.work_details}</p>
                    </div>
                  </div>

                  {/* Message */}
                  {selectedRequest.message && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Additional Message</p>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedRequest.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10">
                  {selectedRequest.status === "new" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusAction(selectedRequest.id, "reject")}
                        className="flex-1 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusAction(selectedRequest.id, "review")}
                        className="flex-1 px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg font-semibold hover:bg-blue-500/20 transition-all"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleStatusAction(selectedRequest.id, "accept")}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                  {selectedRequest.status === "reviewed" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusAction(selectedRequest.id, "reject")}
                        className="flex-1 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusAction(selectedRequest.id, "accept")}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                  {(selectedRequest.status === "accepted" || selectedRequest.status === "rejected") && (
                    <p className="text-center text-gray-400 text-sm py-2">
                      This request has been{" "}
                      <span className={selectedRequest.status === "accepted" ? "text-emerald-400" : "text-red-400"}>
                        {selectedRequest.status}
                      </span>.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
