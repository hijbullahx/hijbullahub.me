import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import { useToast } from "../components/ToastContext";

export default function ContributionRequestsAdmin() {
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
      const response = await api.get("/research-contributions/");
      setRequests(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch contribution requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
    
    // Mark as read
    if (!request.is_read) {
      try {
        await api.post(`/research-contributions/${request.id}/mark_read/`);
        fetchRequests();
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const handleAccept = async (request) => {
    try {
      await api.post(`/research-contributions/${request.id}/accept/`);
      toast.success("Request accepted");
      fetchRequests();
      setDetailsOpen(false);
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleReject = async (request) => {
    if (!confirm("Are you sure you want to reject this request?")) return;

    try {
      await api.post(`/research-contributions/${request.id}/reject/`);
      toast.success("Request rejected");
      fetchRequests();
      setDetailsOpen(false);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const acceptedRequests = requests.filter(r => r.status === "accepted");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  const columns = [
    {
      label: "Email",
      field: "email",
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.email}</p>
          {!row.is_read && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">
              New
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Research Paper",
      field: "research_title",
      render: (row) => (
        <p className="text-gray-300 text-sm">{row.research_title}</p>
      ),
    },
    {
      label: "Status",
      field: "status",
      render: (row) => {
        const colors = {
          pending: "bg-amber-500/20 text-amber-400",
          accepted: "bg-emerald-500/20 text-emerald-400",
          rejected: "bg-red-500/20 text-red-400",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.status] || "bg-gray-500/20 text-gray-400"}`}>
            {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
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
        <h1 className="text-3xl font-bold text-white mb-2">Research Contribution Requests</h1>
        <p className="text-gray-400">Manage interest requests from potential contributors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{pendingRequests.length}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Accepted</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{acceptedRequests.length}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{rejectedRequests.length}</p>
            </div>
            <div className="text-4xl">❌</div>
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
            onDelete={handleReject}
          />
        </div>
      )}

      {/* Accepted Requests Section */}
      {acceptedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Accepted Requests</h2>
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
          <h2 className="text-xl font-bold text-white mb-4">Rejected Requests</h2>
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
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Research Paper</label>
                    <p className="text-white font-semibold text-lg mt-1">{selectedRequest.research_title}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
                    <p className="text-white mt-1">{selectedRequest.email}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        selectedRequest.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        selectedRequest.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
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

                {selectedRequest.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="flex-1 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(selectedRequest)}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
