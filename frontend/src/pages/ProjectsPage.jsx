import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
import api from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
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

  useEffect(() => {
    fetchList("/projects/")
      .then((projects) => setState({ loading: false, error: "", projects }))
      .catch(() => setState({ loading: false, error: "Unable to load projects.", projects: [] }));
  }, []);

  const handleAcquisitionClick = (project) => {
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
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const socialContacts = [
    {
      title: "Gmail",
      link: "mailto:hijbullah119445@gmail.com",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 256 193" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z"/>
          <path fill="#34A853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z"/>
          <path fill="#EA4335" d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504z"/>
          <path fill="#FBBC04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z"/>
          <path fill="#C5221F" d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z"/>
        </svg>
      ),
    },
    {
      title: "GitHub",
      link: "https://github.com/hijbullahx",
      icon: (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "LinkedIn",
      link: "https://linkedin.com/in/hijbullah",
      icon: (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <SectionTitle subtitle="Innovative solutions in AI, robotics, IoT, and autonomous systems">
          All Projects
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {state.projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="overflow-hidden cursor-pointer group h-full flex flex-col">
                <div className="relative h-40 sm:h-48 md:h-52 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-3 sm:mb-4 overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {project.thumbnail || project.featured_image || (project.images && project.images[0]?.image) ? (
                      <img
                        src={project.thumbnail || project.featured_image || project.images[0].image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-cyan/10 via-primary-emerald/10 to-dark-elevated flex items-center justify-center">
                        <span className="text-5xl gradient-text font-bold">
                          {project.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-base/80 to-transparent" />
                  <div className="absolute top-3 right-3">
                    {project.featured && (
                      <GradientBadge className="bg-primary-cyan/30">Featured</GradientBadge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech_stack?.slice(0, 3).map((tech) => (
                    <GradientBadge key={tech.id}>{tech.name}</GradientBadge>
                  ))}
                  {project.tech_stack?.length > 3 && (
                    <GradientBadge>+{project.tech_stack.length - 3}</GradientBadge>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2 group-hover:text-glow transition-all">
                  {project.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-grow line-clamp-2 sm:line-clamp-3">
                  {project.short_description}
                </p>

                <GlowButton
                  onClick={() => setSelectedProject(project)}
                  className="w-full text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  View Details
                </GlowButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}>
        {selectedProject && (
          <div>
            <div className="relative h-48 sm:h-56 md:h-64 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 mb-4 sm:mb-6 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
              {selectedProject.thumbnail || selectedProject.featured_image || (selectedProject.images && selectedProject.images[0]?.image) ? (
                <img
                  src={selectedProject.thumbnail || selectedProject.featured_image || selectedProject.images[0].image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-cyan/20 via-primary-emerald/20 to-dark-elevated flex items-center justify-center">
                  <span className="text-8xl gradient-text font-bold">{selectedProject.title.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-base to-transparent" />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4">{selectedProject.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProject.tech_stack?.map((tech) => (
                    <GradientBadge key={tech.id}>{tech.name}</GradientBadge>
                  ))}
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary-emerald/20 text-primary-emerald text-sm font-semibold">
                  {selectedProject.status}
                </div>
              </div>

              {selectedProject.problem_statement && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-cyan mb-2">Problem Statement</h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{selectedProject.problem_statement}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-cyan mb-2">Description</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{selectedProject.full_description}</p>
              </div>

              {selectedProject.architecture_overview && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-cyan mb-2">Architecture</h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{selectedProject.architecture_overview}</p>
                </div>
              )}
{/* Gallery Section */}
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-cyan mb-3 sm:mb-4">Gallery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {selectedProject.images.map((img) => (
                      <motion.div
                        key={img.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedImage(img)}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={img.image}
                          alt={img.caption || "Project screenshot"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                            {img.caption}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              
              {selectedProject.research_direction && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-cyan mb-2">Research Direction</h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{selectedProject.research_direction}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
                {selectedProject.github_link && (
                  <GlowButton href={selectedProject.github_link} className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                    View on GitHub
                  </GlowButton>
                )}
                {selectedProject.live_link && (
                  <GlowButton href={selectedProject.live_link} className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                    Live Demo
                  </GlowButton>
                )}
                <GlowButton onClick={handleAcquisitionClick} className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                  Acquisition?
                </GlowButton>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-7xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.caption || "Project screenshot"}
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 sm:p-4 rounded-b-lg">
                <p className="text-center text-xs sm:text-sm md:text-base">{selectedImage.caption}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Acquisition Modal */}
      <AnimatePresence>
        {acquisitionModalOpen && selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAcquisitionModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-dark-card border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {submitSuccess ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                    <p className="text-gray-400">We'll get back to you soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold gradient-text">Project Acquisition</h3>
                      <button
                        onClick={() => setAcquisitionModalOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-2">Project:</p>
                      <p className="text-white font-semibold">{selectedProject?.title}</p>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-4 justify-center mb-6 pb-6 border-b border-white/10">
                      {socialContacts.map((contact, idx) => (
                        <motion.a
                          key={idx}
                          href={contact.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1, y: -5 }}
                          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-cyan/50 transition-all"
                        >
                          {contact.icon}
                        </motion.a>
                      ))}
                    </div>

                    <form onSubmit={handleAcquisitionSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                          placeholder="Tell us about your interest in acquiring this project..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setAcquisitionModalOpen(false)}
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
