import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { fetchList } from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientBadge from "../components/GradientBadge";
import HoverTiltCard from "../components/HoverTiltCard";
import LoadingState from "../components/LoadingState";
import ParticleBackground from "../components/ParticleBackground";
import SectionTitle from "../components/SectionTitle";
import TypingAnimation from "../components/TypingAnimation";

export default function HomePage() {
  const [state, setState] = useState({ loading: true, error: "", data: {} });

  useEffect(() => {
    const load = async () => {
      try {
        const [hero, about, skills, projects, aiLab] = await Promise.all([
          fetchList("/hero/"),
          fetchList("/about/"),
          fetchList("/skills/"),
          fetchList("/projects/?featured=true"),
          fetchList("/ai-lab/"),
        ]);

        setState({
          loading: false,
          error: "",
          data: {
            hero: hero.find((h) => h.is_active) ?? hero[0],
            about: about[0],
            skills,
            projects,
            aiLab,
          },
        });
      } catch {
        setState({ loading: false, error: "Unable to load homepage data.", data: {} });
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const latest = state.data.aiLab?.[0];
    if (!latest) return [];
    return [
      { metric: "Accuracy", value: Number(latest.accuracy ?? 0) * 100 },
      { metric: "Precision", value: Number(latest.precision ?? 0) * 100 },
      { metric: "Recall", value: Number(latest.recall ?? 0) * 100 },
      { metric: "F1", value: Number(latest.f1_score ?? 0) * 100 },
    ];
  }, [state.data.aiLab]);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { hero, about, skills, projects } = state.data;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-base/50 to-dark-base" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">{hero?.name}</span>
              </h1>
              
              <div className="text-2xl md:text-3xl text-slate-300 mb-8 h-12">
                <TypingAnimation text={hero?.tagline || "Building the future with AI"} speed={80} />
              </div>
              
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl">
                {hero?.short_bio}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/projects">
                  <GlowButton>View Projects</GlowButton>
                </Link>
                <Link to="/contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-3 rounded-full border-2 border-primary-cyan/30 text-primary-cyan font-semibold hover:bg-primary-cyan/10 transition-all duration-300 inline-block"
                  >
                    Get in Touch
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <HoverTiltCard>
                <div className="relative w-80 h-80 md:w-96 md:h-96">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-cyan/20 to-primary-emerald/20 blur-3xl animate-glow-pulse" />
                  <div className="relative glass rounded-3xl p-2 overflow-hidden">
                    {hero?.profile_image ? (
                      <img
                        src={hero.profile_image}
                        alt={hero.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-cyan/10 to-primary-emerald/10 flex items-center justify-center">
                        <span className="text-6xl gradient-text">AI</span>
                      </div>
                    )}
                  </div>
                </div>
              </HoverTiltCard>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary-cyan/50 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-primary-cyan rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto">
        <SectionTitle subtitle="Autonomous Systems • Machine Learning • IoT Innovation">
          Mission & Vision
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard>
            <h3 className="text-2xl font-bold gradient-text mb-4">Mission Statement</h3>
            <p className="text-slate-300 leading-relaxed">{about?.mission_statement}</p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-2xl font-bold gradient-text mb-4">Vision 2030</h3>
            <p className="text-slate-300 leading-relaxed">{about?.vision_2030}</p>
          </GlassCard>
        </div>
        {about?.quote && (
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-2xl font-semibold gradient-text italic max-w-3xl mx-auto"
          >
            "{about.quote}"
          </motion.blockquote>
        )}
      </AnimatedSection>

      {/* Skills Section */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto" id="skills">
        <SectionTitle subtitle="Technical expertise across multiple domains">
          Core Competencies
        </SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills?.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - skill.level / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold gradient-text">{skill.level}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-1">{skill.name}</h4>
                <p className="text-sm text-slate-400">{skill.category}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Featured Projects */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto" id="projects">
        <SectionTitle subtitle="Innovative solutions in AI, robotics, and autonomous systems">
          Featured Projects
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-8">
          {projects?.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <GlassCard className="overflow-hidden group">
                <div className="relative h-48 mb-4 -mx-6 -mt-6 overflow-hidden">
                  {project.thumbnail || project.featured_image || (project.images && project.images[0]?.image) ? (
                    <motion.img
                      src={project.thumbnail || project.featured_image || project.images[0].image}
                      alt={project.title}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/20 to-primary-emerald/20" />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full bg-gradient-to-br from-dark-elevated to-dark-surface flex items-center justify-center"
                      >
                        <span className="text-5xl gradient-text font-bold">
                          {project.title.charAt(0)}
                        </span>
                      </motion.div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-base/80 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech_stack?.slice(0, 3).map((tech) => (
                    <GradientBadge key={tech.id}>{tech.name}</GradientBadge>
                  ))}
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-3">{project.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-4">{project.short_description}</p>
                <div className="flex gap-3">
                  <GlowButton href={`/projects#${project.slug}`} className="text-sm px-4 py-2">
                    Learn More
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* AI Lab Metrics */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto">
        <SectionTitle subtitle="Real-time performance monitoring">
          AI Lab Dashboard
        </SectionTitle>
        <GlassCard className="p-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="metric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  );
}
