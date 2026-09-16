import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

import { fetchProjects } from "../api/client";
import api from "../api/client";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientBadge from "../components/GradientBadge";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import SectionTitle from "../components/SectionTitle";

export default function ProjectsPage() {
  const [state, setState] = useState({ loading: true, error: "", projects: [] });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [acquisitionModalOpen, setAcquisitionModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Category and Search Filtering
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects()
      .then((projects) => setState({ loading: false, error: "", projects }))
      .catch(() => setState({ loading: false, error: "Unable to load projects.", projects: [] }));
  }, []);

  // Compute categories dynamically
  const categories = useMemo(() => {
    const set = new Set(["All", "Featured"]);
    state.projects.forEach((p) => {
      p.tech_stack?.forEach((t) => {
        if (t.name) set.add(t.name);
      });
    });
    // Top 8 categories for clean UI
    return Array.from(set).slice(0, 8);
  }, [state.projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return state.projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === "All") return true;
      if (activeCategory === "Featured") return !!p.featured;
      return p.tech_stack?.some((t) => t.name === activeCategory);
    });
  }, [state.projects, activeCategory, searchQuery]);

  const handleAcquisitionClick = () => {
    setAcquisitionModalOpen(true);
    setFormData({ email: "", phone: "", message: "" });
    setSubmitSuccess(false);
  };

  const handleAcquisitionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/project-acquisitions/", {
        project: selectedProject.id,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setAcquisitionModalOpen(false);
        setFormData({ email: "", phone: "", message: "" });
      }, 2000);
    } catch {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const socialContacts = [
    { title: "Gmail", link: "mailto:hijbullah119445@gmail.com" },
    { title: "GitHub", link: "https://github.com/hijbullahx" },
    { title: "LinkedIn", link: "https://linkedin.com/in/hijbullah" },
  ];

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SectionTitle subtitle="Innovative solutions across AI, Machine Learning, Robotics, and IoT Architecture">
          Engineered Projects
        </SectionTitle>

        {/* ── Search & Filter Controls ────────────────────────────── */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md shadow-cyan-500/20"
                    : "bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ── Projects Grid ────────────────────────────── */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            No projects matched your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <GlassCard className="overflow-hidden group h-full flex flex-col justify-between">
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden bg-slate-900/10 dark:bg-slate-950">
                      {project.thumbnail || project.featured_image || (project.images && project.images[0]?.image) ? (
                        <img
                          src={project.thumbnail || project.featured_image || project.images[0].image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10">
                          <span className="text-4xl font-extrabold gradient-text">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {project.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500 text-white shadow-md">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tech_stack?.slice(0, 3).map((tech) => (
                        <GradientBadge key={tech.id}>{tech.name}</GradientBadge>
                      ))}
                      {project.tech_stack?.length > 3 && (
                        <GradientBadge>+{project.tech_stack.length - 3}</GradientBadge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-500 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
                      {project.short_description}
                    </p>
                  </div>

                  <GlowButton
                    onClick={() => setSelectedProject(project)}
                    className="w-full text-sm py-2.5"
                  >
                    View Details
                  </GlowButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Project Details Modal ────────────────────────────── */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}>
        {selectedProject && (
          <div>
            <div className="relative h-56 md:h-64 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
              {selectedProject.thumbnail || selectedProject.featured_image || (selectedProject.images && selectedProject.images[0]?.image) ? (
                <img
                  src={selectedProject.thumbnail || selectedProject.featured_image || selectedProject.images[0].image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                  <span className="text-7xl font-extrabold gradient-text">{selectedProject.title.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {selectedProject.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedProject.tech_stack?.map((tech) => (
                    <GradientBadge key={tech.id}>{tech.name}</GradientBadge>
                  ))}
                </div>
                {selectedProject.status && (
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {selectedProject.status}
                  </span>
                )}
              </div>

              {selectedProject.problem_statement && (
                <div>
                  <h3 className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-1.5">Problem Statement</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedProject.problem_statement}
                  </p>
                </div>
              )}

              {selectedProject.full_description && (
                <div>
                  <h3 className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-1.5">Overview</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedProject.full_description}
                  </p>
                </div>
              )}

              {selectedProject.architecture_overview && (
                <div>
                  <h3 className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-1.5">System Architecture</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedProject.architecture_overview}
                  </p>
                </div>
              )}

              {/* Gallery Section */}
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedProject.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImage(img)}
                        className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-slate-900/10"
                      >
                        <img
                          src={img.image}
                          alt={img.caption || "Project image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                {selectedProject.github_link && (
                  <a
                    href={selectedProject.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl font-semibold bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-sm inline-flex items-center gap-2"
                  >
                    GitHub Repository ↗
                  </a>
                )}
                {selectedProject.live_link && (
                  <a
                    href={selectedProject.live_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md text-sm inline-flex items-center gap-2"
                  >
                    Live Demo ↗
                  </a>
                )}
                <button
                  onClick={handleAcquisitionClick}
                  className="px-5 py-2.5 rounded-xl font-semibold border border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
                >
                  Acquisition Inquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Image Lightbox Modal ────────────────────────────── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          <img
            src={selectedImage.image}
            alt={selectedImage.caption || "Screenshot"}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* ── Acquisition Request Modal ────────────────────────────── */}
      <AnimatePresence>
        {acquisitionModalOpen && selectedProject && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Thank you. I will review your inquiry and respond shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Acquisition</h3>
                    <button
                      onClick={() => setAcquisitionModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Inquiring about: <strong className="text-slate-800 dark:text-white">{selectedProject.title}</strong>
                  </p>

                  <form onSubmit={handleAcquisitionSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Message / Scope
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Tell me about your team, timeline, and use-case..."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setAcquisitionModalOpen(false)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md disabled:opacity-50"
                      >
                        {submitting ? "Sending..." : "Submit Inquiry"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
