import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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

function ChevronUp({ disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Move up — show earlier on homepage"
      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

function ChevronDown({ disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Move down — show later on homepage"
      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function FeedbackItem({ fb, onToggle, onDelete, onReply, onDragEnd }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(fb.admin_reply || "");
  const [savingReply, setSavingReply] = useState(false);

  const handleSaveReply = async () => {
    setSavingReply(true);
    await onReply(fb.id, replyText);
    setSavingReply(false);
    setReplyOpen(false);
  };

  return (
    <Reorder.Item
      value={fb}
      onDragEnd={onDragEnd}
      className={`bg-white/5 border rounded-xl p-5 mb-3 transition-colors select-none ${
        fb.is_visible ? "border-white/10" : "border-white/5 opacity-60"
      }`}
      whileDrag={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-start gap-3">
        {/* Order controls */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5 self-center cursor-grab active:cursor-grabbing text-slate-500 hover:text-white transition-colors" title="Drag to reorder">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
           </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-semibold text-white">{fb.name}</span>
            {fb.email && <span className="text-xs text-gray-500 truncate">{fb.email}</span>}
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
          <p className="text-gray-300 text-sm leading-relaxed mb-3">{fb.comment}</p>
          
          {/* Admin Reply Display */}
          {fb.admin_reply && !replyOpen && (
            <div className="bg-cyan-900/20 border-l-2 border-cyan-500 pl-3 py-2 mt-2 rounded-r-lg">
               <p className="text-xs text-cyan-400 font-bold mb-1">Admin Reply:</p>
               <p className="text-sm text-cyan-100/80">{fb.admin_reply}</p>
            </div>
          )}

          {/* Reply Editor */}
          {replyOpen && (
             <div className="mt-3 bg-black/20 p-3 rounded-lg border border-white/10">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500 resize-y min-h-[60px]"
                  placeholder="Write your reply here..."
                />
                <div className="flex justify-end gap-2 mt-2">
                   <button 
                     onClick={() => setReplyOpen(false)}
                     className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSaveReply}
                     disabled={savingReply}
                     className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors disabled:opacity-50"
                   >
                     {savingReply ? "Saving..." : "Save Reply"}
                   </button>
                </div>
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onToggle(fb)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              fb.is_visible
                ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {fb.is_visible ? "Hide" : "Show"}
          </button>
          <button
            onClick={() => setReplyOpen(!replyOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            {fb.admin_reply ? "Edit Reply" : "Reply"}
          </button>
          <button
            onClick={() => onDelete(fb.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { success, error } = useToast();
  const feedbacksRef = useRef(feedbacks);

  useEffect(() => { feedbacksRef.current = feedbacks; }, [feedbacks]);
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/feedback/");
      // Ensure display_order exists
      const items = (data.results ?? data).map((f, i) => ({
         ...f, 
         display_order: f.display_order || i + 1 
      })).sort((a, b) => a.display_order - b.display_order);
      setFeedbacks(items);
    } catch {
      error("Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (fb) => {
    try {
      const { data } = await api.patch(`/feedback/${fb.id}/`, { is_visible: !fb.is_visible });
      setFeedbacks((prev) => prev.map((f) => (f.id === fb.id ? { ...f, ...data } : f)));
      success(`Feedback ${data.is_visible ? "shown" : "hidden"}.`);
    } catch {
      error("Failed to update.");
    }
  };

  const handleReply = async (id, text) => {
     try {
        const { data } = await api.patch(`/feedback/${id}/`, { admin_reply: text });
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, admin_reply: text } : f)));
        success("Reply saved.");
     } catch {
        error("Failed to save reply.");
     }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    try {
      await api.delete(`/feedback/${id}/`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      success("Deleted.");
    } catch {
      error("Failed to delete.");
    }
  };

  const handleReorder = (newOrderedFiltered) => {
    // If showing all, simple update
    if (filter === 'all') {
      setFeedbacks(newOrderedFiltered);
      return;
    }

    // If filtered, preserve the positions of visible items in the main list
    // but fill them with the new order
    const indices = filtered.map(f => feedbacks.findIndex(all => all.id === f.id)).sort((a, b) => a - b);
    const nextFeedbacks = [...feedbacks];
    
    newOrderedFiltered.forEach((item, i) => {
       nextFeedbacks[indices[i]] = item;
    });

    setFeedbacks(nextFeedbacks);
  };

  const saveOrder = async () => {
      // Small delay to ensure state update processes
      setTimeout(async () => {
        try {
           const currentFeedbacks = feedbacksRef.current;
           const updates = currentFeedbacks.map((f, i) => 
               api.patch(`/feedback/${f.id}/`, { display_order: i + 1 })
           );
           await Promise.all(updates);
        } catch {
           error("Failed to save order.");
        }
      }, 500);
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
        <p className="text-gray-400 mt-1">
          Show/hide feedback, reply to users, and reorder homepage cards.
        </p>
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
      <div className="flex gap-2 flex-wrap items-center">
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
        <span className="ml-auto text-xs text-gray-600 select-none">
          Drag items to reorder homepage cards
        </span>
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
          <Reorder.Group axis="y" values={filtered} onReorder={handleReorder}>
            {filtered.map((fb) => (
               <FeedbackItem
                   key={fb.id}
                   fb={fb}
                   onToggle={toggleVisibility}
                   onDelete={deleteFeedback}
                   onReply={handleReply}
                   onDragEnd={saveOrder}
                />
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
