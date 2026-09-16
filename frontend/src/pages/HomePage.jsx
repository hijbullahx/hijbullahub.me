import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { fetchList } from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import HireDrawer from "../components/HireDrawer";
import HoverTiltCard from "../components/HoverTiltCard";
import LoadingState from "../components/LoadingState";
import ParticleBackground from "../components/ParticleBackground";
import SectionTitle from "../components/SectionTitle";
import TypingAnimation from "../components/TypingAnimation";
import FeedbackModal from "../components/FeedbackModal";
import ReviewsDrawer from "../components/ReviewsDrawer";
import { useToast } from "../dashboard/components/ToastContext";

// ── Gallery style feedback card ──────────────────────────────
function FeedbackCard({ fb, onClick }) {
  return (
    <div
      onClick={onClick}
      className="h-full bg-white/80 dark:bg-[#0d1117]/90 border border-slate-200 dark:border-white/10
        backdrop-blur-md p-6 rounded-2xl cursor-pointer select-none
        hover:border-cyan-500/50 dark:hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group shadow-md dark:shadow-none"
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 blur-2xl pointer-events-none group-hover:opacity-100 transition-opacity" />

      {/* Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            viewBox="0 0 24 24"
            fill={s <= fb.rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={`w-3.5 h-3.5 transition-colors ${
              s <= fb.rating ? "text-amber-400" : "text-slate-300 dark:text-white/15"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
      </div>

      <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed flex-1 line-clamp-5 mb-6 relative z-10">
        &ldquo;{fb.comment}&rdquo;
      </p>

      {/* Admin Reply */}
      {fb.admin_reply && (
        <div className="mb-4 bg-cyan-500/10 dark:bg-cyan-950/30 border-l-2 border-cyan-500 pl-3 py-2 rounded-r-lg relative z-10 group/reply">
          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mb-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
            Reply
          </p>
          <p className="text-xs text-slate-600 dark:text-cyan-100/80 italic line-clamp-3 group-hover/reply:line-clamp-none transition-all">
            {fb.admin_reply}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/5 mt-auto relative z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-cyan-500/20">
          {fb.name?.charAt(0).toUpperCase() || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-cyan-500 transition-colors">
            {fb.name}
          </p>
          <div className="flex flex-col">
            {fb.profession && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{fb.profession}</p>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(fb.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const rootUrl = baseUrl.replace(/\/api\/?$/, "");
  let cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (!cleanPath.startsWith("/media/")) {
    cleanPath = `/media${cleanPath}`;
  }
  return `${rootUrl}${cleanPath}`;
};

export default function HomePage() {
  const { success } = useToast();
  const [state, setState] = useState({ loading: true, error: "", data: {} });
  const [hireOpen, setHireOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth > 768 ? current.clientWidth / 2 : current.clientWidth;
      current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const loadFeedbacks = () =>
      fetchList("/feedback/")
        .then((data) => setFeedbacks(data.filter((f) => f.is_visible)))
        .catch(() => {});

    loadFeedbacks();

    const onVisible = () => {
      if (document.visibilityState === "visible") loadFeedbacks();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [hero, about, skills, experience, achievements, education] = await Promise.all([
          fetchList("/hero/"),
          fetchList("/about/"),
          fetchList("/skills/"),
          fetchList("/experience/"),
          fetchList("/achievements/"),
          fetchList("/education/"),
        ]);

        setState({
          loading: false,
          error: "",
          data: {
            hero: hero.find((h) => h.is_active) ?? hero[0],
            about: about[0],
            skills,
            experience,
            achievements,
            education,
          },
        });
      } catch {
        setState({ loading: false, error: "Unable to load homepage data.", data: {} });
      }
    };
    load();
  }, []);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { hero, about, skills, experience, achievements, education } = state.data;

  return (
    <div className="relative">
      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        <ParticleBackground />
        
        {/* Subtle radial backdrop illumination */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/50 to-slate-100 dark:via-slate-950/50 dark:to-slate-950 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Bio & Intro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              {/* Status pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Available for Innovation &amp; Research
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight text-slate-900 dark:text-white">
                Hi, I&apos;m <span className="gradient-text">{hero?.name || "Hijbullah"}</span>
              </h1>

              <div className="text-lg sm:text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300 mb-6 min-h-[3rem] flex items-center justify-center lg:justify-start">
                <TypingAnimation text={hero?.tagline || "Building the future with AI & Autonomous Systems"} speed={60} />
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {hero?.short_bio}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <GlowButton onClick={() => setHireOpen(true)}>
                  <span>💼</span> Engage My Expertise
                </GlowButton>

                <Link
                  to="/projects"
                  className="px-6 py-3 rounded-xl font-semibold border border-slate-300 dark:border-white/15 bg-white/60 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm inline-flex items-center gap-2"
                >
                  Explore Projects <span>→</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Profile Image / Avatar Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <HoverTiltCard>
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  {/* Subtle ambient blur behind avatar */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-cyan-500/10 blur-2xl animate-glow-pulse" />
                  
                  <div className="relative glass rounded-3xl p-3 h-full w-full overflow-hidden shadow-2xl">
                    {hero?.profile_image ? (
                      <img
                        src={hero.profile_image}
                        alt={hero.name}
                        className="w-full h-full object-cover rounded-2xl shadow-inner"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 flex items-center justify-center">
                        <span className="text-6xl font-extrabold gradient-text">AI</span>
                      </div>
                    )}
                  </div>
                </div>
              </HoverTiltCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator (Inside Hero only, scrolls away naturally) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400">Scroll</span>
          <div className="w-5 h-8 border-2 border-cyan-500/40 rounded-full flex justify-center pt-1">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-cyan-400 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* ── About Section ────────────────────────────── */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto">
        <SectionTitle subtitle="Autonomous Systems • Machine Learning • IoT Innovation">
          Mission &amp; Vision
        </SectionTitle>
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg font-bold">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mission</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              {about?.mission_statement}
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
                🚀
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Vision</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              {about?.vision_2030}
            </p>
          </GlassCard>
        </div>

        {about?.quote && (
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 italic max-w-3xl mx-auto px-4"
          >
            &ldquo;{about.quote}&rdquo;
          </motion.blockquote>
        )}
      </AnimatedSection>

      {/* ── Skills Section ────────────────────────────── */}
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
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard className="text-center h-full flex flex-col items-center">
                <div className="relative w-20 h-20 mx-auto mb-4 flex-shrink-0">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-slate-200 dark:stroke-white/10"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="url(#skillGrad)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - skill.level / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {skill.icon ? (
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-10 h-10 object-contain rounded-full"
                      />
                    ) : (
                      <span className="text-base font-bold text-slate-800 dark:text-white">
                        {skill.level}%
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">{skill.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{skill.category}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Education Section ────────────────────────────── */}
      {education?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="education">
          <SectionTitle subtitle="Academic Background &amp; Qualifications">
            Education
          </SectionTitle>
          <div className="flex flex-col gap-4 mt-6 max-w-4xl mx-auto">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                onClick={() => setSelectedEducation(edu)}
                className="cursor-pointer group relative"
              >
                <div
                  className={`p-5 rounded-2xl border transition-all flex items-center gap-5 relative overflow-hidden backdrop-blur-md ${
                    edu.is_current
                      ? "border-l-4 border-l-cyan-500 border-slate-200 dark:border-white/10 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-md"
                      : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-cyan-500/40 shadow-sm"
                  }`}
                >
                  {edu.is_current && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                        CURRENT
                      </div>
                    </div>
                  )}

                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {edu.institution_logo_url || edu.institution_logo ? (
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <img
                          src={edu.institution_logo_url || edu.institution_logo}
                          alt={edu.institution_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl">
                        🎓
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors truncate">
                      {edu.degree_name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium truncate">
                        {edu.institution_name}
                      </p>
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Details ↗
                      </span>
                    </div>
                    {edu.location && (
                      <p className="text-xs text-slate-500 mt-1">📍 {edu.location}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* ── Experience Section ────────────────────────────── */}
      {experience?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="experience">
          <SectionTitle subtitle="Professional history, roles &amp; key achievements">
            Experience
          </SectionTitle>
          <div className="mt-8 relative max-w-4xl mx-auto">
            <div className="space-y-5">
              {experience.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                >
                  <div
                    className={`relative bg-white/70 dark:bg-white/[0.03] border rounded-2xl p-6 backdrop-blur-md transition-all group ${
                      exp.highlight
                        ? "border-amber-500/40 shadow-md shadow-amber-500/5"
                        : "border-slate-200 dark:border-white/10 hover:border-cyan-500/40"
                    }`}
                  >
                    {exp.highlight && (
                      <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Featured Role
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      {exp.logo_url ? (
                        <img
                          src={exp.logo_url}
                          alt={exp.organization || exp.role}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl flex-shrink-0">
                          💼
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                          {exp.role}
                        </h3>
                        {exp.organization && (
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                            {exp.organization}
                          </p>
                        )}
                        {exp.duration && (
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                            {exp.duration}
                          </span>
                        )}
                        {exp.description && (
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Achievements Section ────────────────────────────── */}
      {achievements?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="achievements">
          <SectionTitle subtitle="Awards, certifications &amp; accolades">
            Achievements
          </SectionTitle>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((a, idx) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="relative bg-white/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition-all group backdrop-blur-md flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  {a.badge_image_url ? (
                    <img
                      src={a.badge_image_url}
                      alt={a.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                      🏆
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-amber-500 transition-colors">
                      {a.title}
                    </h3>
                    {a.issuer && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.issuer}</p>}
                    {a.date && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-white/5 text-slate-500">
                        {new Date(a.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                {a.certificate_link && (
                  <a
                    href={a.certificate_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-colors"
                  >
                    View Credential ↗
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* ── Feedback & Reviews Section ────────────────────────────── */}
      {feedbacks?.length >= 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto overflow-hidden">
          <SectionTitle subtitle="Client testimonials, partner reviews, and endorsements">
            Feedback &amp; Reviews
          </SectionTitle>

          <div className="relative mt-8 group/carousel">
            {/* Left Scroll Arrow */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/60 border border-white/20 text-white backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-cyan-500 hover:border-cyan-500 hidden md:block"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Carousel Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {feedbacks.map((fb, index) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="min-w-[300px] md:min-w-[360px] snap-center h-[310px]"
                >
                  <FeedbackCard fb={fb} onClick={() => setReviewsOpen(true)} />
                </motion.div>
              ))}
            </div>

            {/* Right Scroll Arrow */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/60 border border-white/20 text-white backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-cyan-500 hover:border-cyan-500 hidden md:block"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-center mt-6 gap-4">
            <button
              onClick={() => setReviewsOpen(true)}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm backdrop-blur-md"
            >
              View All ({feedbacks.length}) Reviews
            </button>

            <GlowButton onClick={() => setFeedbackOpen(true)}>
              <span>✍️</span> Leave a Review
            </GlowButton>
          </div>
        </AnimatedSection>
      )}

      {/* ── Education Detail Modal ────────────────────────────── */}
      <AnimatePresence>
        {selectedEducation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEducation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header Image/Pattern */}
              <div className="h-28 bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-25" />
                <button
                  onClick={() => setSelectedEducation(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md z-10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 -mt-10 relative flex-1 overflow-y-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-cyan-500/30 shadow-xl mb-4 relative overflow-hidden flex items-center justify-center">
                    {selectedEducation.institution_logo_url || selectedEducation.institution_logo ? (
                      <img
                        src={selectedEducation.institution_logo_url || selectedEducation.institution_logo}
                        alt={selectedEducation.institution_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🎓</span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {selectedEducation.degree_name}
                  </h2>
                  <p className="text-base text-cyan-600 dark:text-cyan-400 font-semibold mb-2">
                    {selectedEducation.institution_name}
                  </p>
                  {selectedEducation.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                      📍 {selectedEducation.location}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/10">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Timeline</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {selectedEducation.start_date ? formatDate(selectedEducation.start_date) : ""} —{" "}
                        {selectedEducation.is_current
                          ? "Present"
                          : selectedEducation.end_date
                          ? formatDate(selectedEducation.end_date)
                          : ""}
                      </p>
                    </div>
                    {selectedEducation.result && (
                      <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Result</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                          {selectedEducation.result}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEducation.description && (
                  <div className="mb-6 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-xl border border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedEducation.description}
                  </div>
                )}

                {selectedEducation.certificate && (
                  <div className="mt-4">
                    <a
                      href={getMediaUrl(selectedEducation.certificate)}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 transition-colors shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Credential File
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewsDrawer
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        feedbacks={feedbacks}
        onLeaveFeedback={() => {
          setReviewsOpen(false);
          setFeedbackOpen(true);
        }}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmitted={(newFb) => {
          setFeedbacks((prev) => [...prev, newFb]);
          success("Thank you for your feedback!");
        }}
      />

      <HireDrawer isOpen={hireOpen} onClose={() => setHireOpen(false)} />
    </div>
  );
}
