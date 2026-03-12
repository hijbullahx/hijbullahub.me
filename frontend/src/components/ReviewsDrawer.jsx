import { AnimatePresence, motion } from "framer-motion";

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className="w-3.5 h-3.5"
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

export default function ReviewsDrawer({ isOpen, onClose, feedbacks = [], onLeaveFeedback }) {
  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="reviews-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />

          {/* Drawer panel */}
          <motion.div
            key="reviews-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[90] flex flex-col
              bg-[#0B0F19] border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Feedback &amp; Reviews</h2>
                {avg && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRow rating={Math.round(Number(avg))} />
                    <span className="text-sm text-gray-400">
                      {avg} avg · {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Reviews list */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {feedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-slate-400 text-lg mb-1">No reviews yet</p>
                  <p className="text-slate-500 text-sm">Be the first to share your thoughts!</p>
                </div>
              ) : (
                feedbacks.map((fb, idx) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                  >
                    {/* Stars + date */}
                    <div className="flex items-center justify-between mb-2">
                      <StarRow rating={fb.rating} />
                      <span className="text-xs text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Comment */}
                    {fb.comment && (
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    )}

                    {/* Admin Reply */}
                    {fb.admin_reply && (
                      <div className="mb-3 ml-1 pl-3 py-2 border-l-2 border-cyan-500/50 bg-cyan-950/20 text-xs rounded-r-md">
                        <span className="block text-cyan-400 font-bold mb-0.5">Admin Reply</span>
                        <p className="text-cyan-100/80 italic">{fb.admin_reply}</p>
                      </div>
                    )}
                    
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {fb.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-white">{fb.name}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-5 border-t border-white/10 flex-shrink-0">
              <motion.button
                onClick={() => { onClose(); onLeaveFeedback(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20
                  border border-cyan-500/30 text-cyan-400 font-semibold
                  hover:from-cyan-500/30 hover:to-emerald-500/30 hover:border-cyan-500/50
                  transition-all duration-300"
              >
                ⭐ Leave Your Feedback
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
