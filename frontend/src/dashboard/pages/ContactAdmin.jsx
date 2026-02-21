import { useState, useEffect } from "react";
import api from "../../api/client";
import DataTable from "../components/DataTable";
import { useToast } from "../components/ToastContext";
import { motion } from "framer-motion";

export default function ContactAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/contact/");
      setMessages(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (message) => {
    try {
      await api.patch(`/contact/${message.id}/`, { is_read: true });
      toast.success("Marked as read");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const handleDelete = async (message) => {
    if (!confirm("Delete this message?")) return;

    try {
      await api.delete(`/contact/${message.id}/`);
      toast.success("Message deleted");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const columns = [
    {
      label: "Status",
      field: "is_read",
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_read && (
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          )}
          <span className={row.is_read ? "text-gray-500" : "text-cyan-400 font-medium"}>
            {row.is_read ? "Read" : "New"}
          </span>
        </div>
      ),
    },
    {
      label: "Name",
      field: "name",
      render: (row) => <span className="font-medium text-white">{row.name}</span>,
    },
    {
      label: "Email",
      field: "email",
    },
    {
      label: "Subject",
      field: "subject",
    },
    {
      label: "Date",
      field: "timestamp",
      render: (row) => new Date(row.timestamp).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
        <p className="text-gray-400">View and manage contact form submissions</p>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        onEdit={(message) => setSelectedMessage(message)}
        onDelete={handleDelete}
      />

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedMessage(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white font-medium">{selectedMessage.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Subject</label>
                  <p className="text-white font-medium">{selectedMessage.subject}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Message</label>
                  <p className="text-white whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/10">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Received</label>
                  <p className="text-white">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                {!selectedMessage.is_read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedMessage);
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
