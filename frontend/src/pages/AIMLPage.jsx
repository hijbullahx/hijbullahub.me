import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientBadge from "../components/GradientBadge";
import LoadingState from "../components/LoadingState";
import SectionTitle from "../components/SectionTitle";

export default function AIMLPage() {
  const [state, setState] = useState({ loading: true, error: "", projects: [] });

  useEffect(() => {
    fetchList("/ai-lab/")
      .then((projects) => setState({ loading: false, error: "", projects }))
      .catch(() => setState({ loading: false, error: "Unable to load AI/ML projects.", projects: [] }));
  }, []);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <SectionTitle subtitle="Machine Learning experiments, AI models, and intelligent systems">
          AI/ML Lab
        </SectionTitle>

        {state.projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-gray-400 text-lg">No AI/ML projects yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {state.projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard className="h-full flex flex-col">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <GradientBadge
                      className={
                        project.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : project.status === "completed"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-amber-500/20 text-amber-400"
                      }
                    >
                      {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                    </GradientBadge>
                    <div className="text-2xl">
                      {project.status === "active" ? "🟢" : project.status === "completed" ? "✅" : "⏸️"}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold gradient-text mb-3">
                    {project.title}
                  </h3>

                  {/* Details */}
                  {project.details && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {project.details}
                    </p>
                  )}

                  {/* Model Info */}
                  {(project.model_name || project.dataset_name) && (
                    <div className="mb-4 space-y-2">
                      {project.model_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Model:</span>
                          <span className="text-cyan-400 font-medium">{project.model_name}</span>
                        </div>
                      )}
                      {project.dataset_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Dataset:</span>
                          <span className="text-emerald-400 font-medium">{project.dataset_name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  {(project.accuracy || project.precision || project.recall || project.f1_score) && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {project.accuracy && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Accuracy</p>
                          <p className={`text-lg font-bold ${
                            project.accuracy >= 0.9 ? "text-emerald-400" :
                            project.accuracy >= 0.7 ? "text-cyan-400" :
                            "text-amber-400"
                          }`}>
                            {(project.accuracy * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {project.precision && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Precision</p>
                          <p className="text-lg font-bold text-purple-400">
                            {(project.precision * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {project.recall && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Recall</p>
                          <p className="text-lg font-bold text-blue-400">
                            {(project.recall * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {project.f1_score && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">F1 Score</p>
                          <p className="text-lg font-bold text-pink-400">
                            {(project.f1_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confusion Matrix */}
                  {project.confusion_matrix_image && (
                    <div className="mb-4">
                      <img
                        src={project.confusion_matrix_image}
                        alt="Confusion Matrix"
                        className="w-full rounded-lg border border-white/10"
                      />
                    </div>
                  )}

                  {/* Link Button */}
                  {project.link && (
                    <div className="mt-auto pt-4">
                      <GlowButton
                        href={project.link}
                        className="w-full text-center px-4 py-2"
                      >
                        View Details
                      </GlowButton>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
