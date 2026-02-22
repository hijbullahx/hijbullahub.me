import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import { useToast } from "../components/ToastContext";

const STARS = [1, 2, 3, 4, 5];

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map((s) => (
        <svg
          key={s}
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: s <= rating ? "#f59e0b" : "rgba(255,255,255,0.15)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | visible | hidden
  const { showToast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/feedback/");
      setFeedbacks(data.results ?? data);
    } catch {
      showToast("Failed to load feedback.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (fb) => {
    try {
      const { data } = await api.patch(`/feedback/${fb.id}/`, { is_visible: !fb.is_visible });
      setFeedbacks((prev) => prev.map((f) => (f.id === fb.id ? data : f)));
      showToast(`Feedback ${data.is_visible ? "shown" : "hidden"}.`, "success");
    } catch {
      showToast("Failed to update.", "error");
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    try {
      await api.delete(`/feedback/${id}/`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast("Deleted.", "success");
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (filter === "visible") return f.is_visible;
    if (filter === "hidden") return !f.is_visible;
    return true;
  });

  const totalVisible = feedbacks.filter((f) => f.is_visible).length;
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : "—";

  const stats = [
    { label: "Total", value: feedbacks.length, icon: "💬", color: "from-cyan-500 to-blue-500" },
    { label: "Visible", value: totalVisible, icon: "👁️", color: "from-emerald-500 to-teal-500" },
    { label: "Hidden", value: feedbacks.length - totalVisible, icon: "🚫", color: "from-rose-500 to-pink-500" },
    { label: "Avg Rating", value: avgRating, icon: "⭐", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Feedback Manager</h1>
        <p className="text-gray-400 mt-1">Review, show or hide public feedback from visitors.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{s.label}</span>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "visible", "hidden"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === tab
                ? "bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 border border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-5xl mb-3">💬</p>
          <p>No feedback here yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb, idx) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`bg-white/5 border rounded-xl p-5 transition-all ${
                fb.is_visible ? "border-white/10" : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-semibold text-white">{fb.name}</span>
                    {fb.email && (
                      <span className="text-xs text-gray-500 truncate">{fb.email}</span>
                    )}
                    <StarDisplay rating={fb.rating} />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        fb.is_visible
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {fb.is_visible ? "Visible" : "Hidden"}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{fb.comment}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => toggleVisibility(fb)}
                    title={fb.is_visible ? "Hide" : "Show"}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      fb.is_visible
                        ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {fb.is_visible ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => deleteFeedback(fb.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
