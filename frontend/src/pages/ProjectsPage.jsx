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

  useEffect(() => {
    fetchList("/projects/")
      .then((projects) => setState({ loading: false, error: "", projects }))
      .catch(() => setState({ loading: false, error: "Unable to load projects.", projects: [] }));
  }, []);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionTitle subtitle="Innovative solutions in AI, robotics, IoT, and autonomous systems">
          All Projects
        </SectionTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {state.projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="overflow-hidden cursor-pointer group h-full flex flex-col">
                <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full bg-gradient-to-br from-primary-cyan/10 via-primary-emerald/10 to-dark-elevated"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl gradient-text font-bold">
                        {project.title.charAt(0)}
                      </span>
                    </div>
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

                <h3 className="text-xl font-bold gradient-text mb-2 group-hover:text-glow transition-all">
                  {project.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                  {project.short_description}
                </p>

                <GlowButton
                  onClick={() => setSelectedProject(project)}
                  className="w-full text-sm px-4 py-2"
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
            <div className="relative h-64 -mx-8 -mt-8 mb-6 overflow-hidden rounded-t-2xl">
              <div className="w-full h-full bg-gradient-to-br from-primary-cyan/20 via-primary-emerald/20 to-dark-elevated flex items-center justify-center">
                <span className="text-8xl gradient-text font-bold">{selectedProject.title.charAt(0)}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-base to-transparent" />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold gradient-text mb-4">{selectedProject.title}</h2>
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
                  <h3 className="text-xl font-semibold text-primary-cyan mb-2">Problem Statement</h3>
                  <p className="text-slate-300 leading-relaxed">{selectedProject.problem_statement}</p>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-primary-cyan mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{selectedProject.full_description}</p>
              </div>

              {selectedProject.architecture_overview && (
                <div>
                  <h3 className="text-xl font-semibold text-primary-cyan mb-2">Architecture</h3>
                  <p className="text-slate-300 leading-relaxed">{selectedProject.architecture_overview}</p>
                </div>
              )}

              {selectedProject.research_direction && (
                <div>
                  <h3 className="text-xl font-semibold text-primary-cyan mb-2">Research Direction</h3>
                  <p className="text-slate-300 leading-relaxed">{selectedProject.research_direction}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                {selectedProject.github_link && (
                  <GlowButton href={selectedProject.github_link} className="px-6 py-3">
                    View on GitHub
                  </GlowButton>
                )}
                {selectedProject.live_link && (
                  <GlowButton href={selectedProject.live_link} className="px-6 py-3">
                    Live Demo
                  </GlowButton>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
