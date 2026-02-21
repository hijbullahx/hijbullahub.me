import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { fetchList } from "../api/client";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientBadge from "../components/GradientBadge";
import LoadingState from "../components/LoadingState";
import SectionTitle from "../components/SectionTitle";

export default function ResearchPage() {
  const [state, setState] = useState({ loading: true, error: "", items: [] });

  useEffect(() => {
    fetchList("/research/")
      .then((items) => setState({ loading: false, error: "", items }))
      .catch(() => setState({ loading: false, error: "Unable to load research data.", items: [] }));
  }, []);

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
                  <p className="text-slate-300 leading-relaxed text-sm">{item.abstract}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-cyan mb-2">Methodology</h4>
                  <p className="text-slate-300 leading-relaxed text-sm">{item.methodology}</p>
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
                    <p className="text-slate-300 leading-relaxed text-sm">{item.future_scope}</p>
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
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
