import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
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

  useEffect(() => {
    fetchList("/projects/")
      .then((projects) => setState({ loading: false, error: "", projects }))
      .catch(() => setState({ loading: false, error: "Unable to load projects.", projects: [] }));
  }, []);

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
    </div>
  );
}
