import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
import api from "../api/client";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientBadge from "../components/GradientBadge";
import LoadingState from "../components/LoadingState";
import SectionTitle from "../components/SectionTitle";

export default function ResearchPage() {
  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchList("/research/")
      .then((items) => setState({ loading: false, error: "", items }))
      .catch(() => setState({ loading: false, error: "Unable to load research data.", items: [] }));
  }, []);

  const handleContributeClick = (research) => {
    setSelectedResearch(research);
    setModalOpen(true);
    setFormData({ email: "", message: "" });
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/research-contributions/", {
        research: selectedResearch.id,
        email: formData.email,
        message: formData.message,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setFormData({ email: "", message: "" });
      }, 2000);
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionTitle subtitle="Advancing the frontiers of AI, robotics, and autonomous systems">
          Research Portfolio
        </SectionTitle>

        <div className="grid md:grid-cols-2 gap-8">
          {state.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary-cyan/20 to-primary-emerald/20 border border-primary-cyan/30">
                    <span className="text-xs font-semibold text-primary-cyan">{item.status}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold gradient-text mb-4 leading-tight">
                  {item.title}
                </h3>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-cyan mb-2">Abstract</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{item.abstract}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-cyan mb-2">Methodology</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{item.methodology}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-cyan mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.technologies?.split(",").map((tech, i) => (
                      <GradientBadge key={i}>{tech.trim()}</GradientBadge>
                    ))}
                  </div>
                </div>

                {item.future_scope && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-primary-emerald mb-2">Future Scope</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{item.future_scope}</p>
                  </div>
                )}

                <div className="mt-auto pt-4 flex gap-3">
                  {item.paper_link && (
                    <GlowButton href={item.paper_link} className="text-sm px-4 py-2">
                      Read Paper
                    </GlowButton>
                  )}
                  {item.pdf_upload && (
                    <motion.a
                      href={item.pdf_upload}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 text-sm rounded-full border border-primary-cyan/30 text-primary-cyan hover:bg-primary-cyan/10 transition-all"
                    >
                      Download PDF
                    </motion.a>
                  )}
                  {(item.status === "planning" || item.status === "active") && (
                    <motion.button
                      onClick={() => handleContributeClick(item)}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 text-sm rounded-full border border-primary-emerald/30 text-primary-emerald hover:bg-primary-emerald/10 transition-all"
                    >
                      Interested to Contribute
                    </motion.button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contribution Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {submitSuccess ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h3>
                    <p className="text-slate-500 dark:text-gray-400">We'll get back to you soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold gradient-text">Interested to Contribute</h3>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">Research Paper:</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{selectedResearch?.title}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message (Optional)
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                          placeholder="Tell us about your interest and expertise..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setModalOpen(false)}
                          className="flex-1 px-6 py-2 text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-cyan to-primary-emerald text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
