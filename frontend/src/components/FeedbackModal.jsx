import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <svg
            className="w-9 h-9 transition-colors duration-150"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            style={{
              color: (hovered || value) >= star ? "#f59e0b" : "rgba(255,255,255,0.2)",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function FeedbackModal({ onClose, onSubmitted }) {
  const [form, setForm] = useState({ name: "", email: "", rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (form.rating === 0) return setError("Please select a star rating.");

    setSubmitting(true);
    try {
      const { data } = await api.post("/feedback/", {
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });
      onSubmitted(data);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Leave Feedback</h2>
                <p className="text-sm text-gray-400 mt-0.5">Share your thoughts — it means a lot!</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  How would you rate this portfolio?
                </label>
                <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Comment <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={(e) => set("comment", e.target.value)}
                  placeholder="Write your feedback here..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
