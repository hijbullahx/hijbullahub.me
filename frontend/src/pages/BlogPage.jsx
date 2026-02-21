import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GradientBadge from "../components/GradientBadge";
import LoadingState from "../components/LoadingState";
import SectionTitle from "../components/SectionTitle";

export default function BlogPage() {
  const [state, setState] = useState({ loading: true, error: "", blog: [] });

  useEffect(() => {
    fetchList("/blog/?is_published=true")
      .then((blog) => setState({ loading: false, error: "", blog }))
      .catch(() => setState({ loading: false, error: "Unable to load blog posts.", blog: [] }));
  }, []);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto section-padding">
        <SectionTitle subtitle="Insights, tutorials, and thoughts on AI & technology">
          Blog
        </SectionTitle>

        <div className="space-y-8">
          {state.blog.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="overflow-hidden group">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="relative h-48 md:h-auto -mx-6 -mt-6 md:mx-0 md:my-0 md:-ml-6 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full"
                    >
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-cyan/20 to-primary-emerald/20 flex items-center justify-center">
                          <span className="text-6xl gradient-text font-bold">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-base/60 to-transparent" />
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <GradientBadge>{post.category}</GradientBadge>
                        <span className="text-sm text-slate-400">{post.read_time} min read</span>
                        {post.featured && (
                          <GradientBadge className="bg-primary-emerald/30 border-primary-emerald/30 text-primary-emerald">
                            Featured
                          </GradientBadge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold gradient-text mb-3 group-hover:text-glow transition-all">
                        {post.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-4">{post.seo_description}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="text-primary-cyan font-semibold flex items-center gap-2"
                      >
                        Read Article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
