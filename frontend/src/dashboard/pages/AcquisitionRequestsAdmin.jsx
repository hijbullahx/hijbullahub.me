import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import { useToast } from "../components/ToastContext";

export default function AcquisitionRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/project-acquisitions/");
      setRequests(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch acquisition requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleStatusUpdate = async (requestId, action) => {
    try {
      await api.post(`/project-acquisitions/${requestId}/${action}/`);
      toast.success(`Request ${action}ed`);
      fetchRequests();
      setDetailsOpen(false);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const contactedRequests = requests.filter(r => r.status === "contacted");
  const negotiationRequests = requests.filter(r => r.status === "in_negotiation");
  const acceptedRequests = requests.filter(r => r.status === "accepted");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  const columns = [
    {
      label: "Contact",
      field: "email",
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.email}</p>
          {row.phone && (
            <p className="text-xs text-gray-400 mt-1">{row.phone}</p>
          )}
        </div>
      ),
    },
    {
      label: "Project",
      field: "project_title",
      render: (row) => (
        <p className="text-gray-300 text-sm">{row.project_title}</p>
      ),
    },
    {
      label: "Status",
      field: "status",
      render: (row) => {
        const colors = {
          pending: "bg-amber-500/20 text-amber-400",
          contacted: "bg-blue-500/20 text-blue-400",
          in_negotiation: "bg-purple-500/20 text-purple-400",
          accepted: "bg-emerald-500/20 text-emerald-400",
          rejected: "bg-red-500/20 text-red-400",
        };
        const labels = {
          pending: "Pending",
          contacted: "Contacted",
          in_negotiation: "In Negotiation",
          accepted: "Accepted",
          rejected: "Rejected",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {labels[row.status] || row.status}
          </span>
        );
      },
    },
    {
      label: "Date",
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Project Acquisition Requests</h1>
        <p className="text-gray-400">Manage inquiries from potential project acquirers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pendingRequests.length}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Contacted</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{contactedRequests.length}</p>
            </div>
            <div className="text-3xl">📞</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Negotiating</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{negotiationRequests.length}</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Accepted</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{acceptedRequests.length}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Rejected</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{rejectedRequests.length}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
          <DataTable
            columns={columns}
            data={pendingRequests}
            loading={loading}
            onEdit={handleViewDetails}
          />
        </div>
      )}

      {/* Contacted Requests Section */}
      {contactedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Contacted</h2>
          <DataTable
            columns={columns}
            data={contactedRequests}
            loading={loading}
            onEdit={handleViewDetails}
          />
        </div>
      )}

      {/* In Negotiation Requests Section */}
      {negotiationRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">In Negotiation</h2>
          <DataTable
            columns={columns}
            data={negotiationRequests}
            loading={loading}
            onEdit={handleViewDetails}
          />
        </div>
      )}

      {/* Accepted Requests Section */}
      {acceptedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Accepted</h2>
          <DataTable
            columns={columns}
            data={acceptedRequests}
            loading={loading}
            onEdit={handleViewDetails}
          />
        </div>
      )}

      {/* Rejected Requests Section */}
      {rejectedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Rejected</h2>
          <DataTable
            columns={columns}
            data={rejectedRequests}
            loading={loading}
            onEdit={handleViewDetails}
          />
        </div>
      )}

      {/* Details Modal */}
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
                className="bg-dark-card border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold gradient-text">Request Details</h3>
                  <button
                    onClick={() => setDetailsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Project</label>
                    <p className="text-white font-semibold text-lg mt-1">{selectedRequest.project_title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
                      <p className="text-white mt-1">{selectedRequest.email}</p>
                    </div>
                    {selectedRequest.phone && (
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide">Phone</label>
                        <p className="text-white mt-1">{selectedRequest.phone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        selectedRequest.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        selectedRequest.status === "contacted" ? "bg-blue-500/20 text-blue-400" :
                        selectedRequest.status === "in_negotiation" ? "bg-purple-500/20 text-purple-400" :
                        selectedRequest.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {selectedRequest.status === "in_negotiation" ? "In Negotiation" :
                         selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Submitted</label>
                    <p className="text-white mt-1">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>

                  {selectedRequest.message && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Message</label>
                      <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-gray-300 leading-relaxed">{selectedRequest.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons Based on Status */}
                <div className="pt-4 border-t border-white/10">
                  {selectedRequest.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "reject")}
                        className="flex-1 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "contact")}
                        className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        Mark as Contacted
                      </button>
                    </div>
                  )}

                  {selectedRequest.status === "contacted" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "reject")}
                        className="flex-1 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "negotiate")}
                        className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        Start Negotiation
                      </button>
                    </div>
                  )}

                  {selectedRequest.status === "in_negotiation" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "reject")}
                        className="flex-1 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, "accept")}
                        className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  {(selectedRequest.status === "accepted" || selectedRequest.status === "rejected") && (
                    <div className="text-center py-2">
                      <p className="text-gray-400 text-sm">
                        This request has been {selectedRequest.status}
                      </p>
                    </div>
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
