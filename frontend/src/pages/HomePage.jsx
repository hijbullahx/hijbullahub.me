import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
        hover:border-primary-cyan/40 dark:hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group shadow-lg"
    >
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary-cyan/10 to-primary-emerald/5 blur-2xl pointer-events-none group-hover:opacity-100 transition-opacity" />

      {/* Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} viewBox="0 0 24 24"
            fill={s <= fb.rating ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth={1.5}
            style={{ color: s <= fb.rating ? "#f59e0b" : "var(--star-inactive, rgba(255,255,255,0.15))" }}
            className={`w-3 h-3 transition-colors ${s > fb.rating ? "text-slate-300 dark:text-white/15" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
      </div>

      <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed flex-1 line-clamp-5 mb-6 relative z-10">
        &ldquo;{fb.comment}&rdquo;
      </p>

      {/* Admin Reply */}
      {fb.admin_reply && (
        <div className="mb-4 bg-primary-cyan/10 dark:bg-cyan-950/30 border-l-2 border-primary-cyan pl-3 py-2 rounded-r-lg relative z-10 group/reply">
          <p className="text-xs text-primary-cyan font-bold mb-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary-cyan"></span>
            Reply
          </p>
          <p className="text-xs text-slate-600 dark:text-cyan-100/80 italic line-clamp-3 group-hover/reply:line-clamp-none transition-all">
            {fb.admin_reply}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/5 mt-auto relative z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-cyan to-primary-emerald flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-cyan-500/20">
          {fb.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-cyan transition-colors">{fb.name}</p>
          <div className="flex flex-col">
            {fb.profession && (
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium truncate">{fb.profession}</p>
            )}
            <p className="text-[10px] text-slate-400 dark:text-gray-500">{new Date(fb.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
};

// Helper for handling media URLs (ensures they are absolute)
const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    // Remove '/api' from base URL if present to get root
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    
    // Common issue: path stored as 'hero/resume.pdf' but served at '/media/hero/resume.pdf'
    // If it doesn't start with /media/ and is not absolute, prepend /media
    let cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (!cleanPath.startsWith('/media/')) {
        cleanPath = `/media${cleanPath}`;
    }
    
    return `${rootUrl}${cleanPath}`;
};

export default function HomePage() {
  const { success } = useToast();
  const [state, setState] = useState({ loading: true, error: "", data: {} });
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
        current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadFeedbacks = () =>
      fetchList("/feedback/").then((data) => setFeedbacks(data.filter((f) => f.is_visible))).catch(() => {});

    loadFeedbacks();

    const onVisible = () => { if (document.visibilityState === "visible") loadFeedbacks(); };
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

  useEffect(() => {
    const handleScroll = () => { setScrollY(window.scrollY); };
    const handleMouseMove = (e) => { setMousePos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);


  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { hero, about, skills, experience, achievements, education } = state.data;

  const iconX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const iconY = typeof window !== 'undefined' ? window.innerHeight - 64 : 0;
  const angle = Math.atan2(mousePos.y - iconY, mousePos.x - iconX) * (180 / Math.PI);
  const mouseAngle = angle + 90;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-surface/50 to-light-base dark:via-dark-base/50 dark:to-dark-base" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 leading-tight">
                <span className="gradient-text">{hero?.name}</span>
              </h1>
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 md:mb-6 min-h-8 leading-snug">
                <TypingAnimation text={hero?.tagline || "Building the future with AI"} speed={80} />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                {hero?.short_bio}
              </p>
              <div className="flex flex-wrap gap-4">
                <GlowButton onClick={() => setHireOpen(true)}>
                  💼 Engage My Expertise
                </GlowButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <HoverTiltCard>
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-cyan/20 to-primary-emerald/20 blur-3xl animate-glow-pulse" />
                  <div className="relative glass rounded-3xl p-2 overflow-hidden">
                    {hero?.profile_image ? (
                      <img src={hero.profile_image} alt={hero.name} className="w-full h-full object-cover rounded-2xl" />
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
          style={{ position: "fixed", bottom: "2rem", left: "50%", transform: `translateX(-50%)`, zIndex: 50 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-primary-cyan/50 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-dark-base/30"
          >
            <motion.div 
              className="w-1 h-2 bg-primary-cyan rounded-full"
              animate={{ rotate: mouseAngle * 0.2 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
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
            <h3 className="text-2xl font-bold gradient-text mb-4">Mission</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{about?.mission_statement}</p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-2xl font-bold gradient-text mb-4">Vision</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{about?.vision_2030}</p>
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
                <div className="relative w-24 h-24 mx-auto mb-4 flex-shrink-0">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r="40" className="stroke-slate-200 dark:stroke-white/10 text-transparent" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="url(#gradient)" strokeWidth="8" fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - skill.level / 100)}`}
                      strokeLinecap="round" className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    {skill.icon ? (
                      <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover rounded-full drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
                    ) : (
                      <span className="text-2xl font-bold gradient-text">{skill.level}</span>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-1 text-slate-800 dark:text-white">{skill.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{skill.category}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Education Section */}
      {education?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="education">
          <SectionTitle subtitle="Academic Background & Qualifications">
            Education
          </SectionTitle>
          <div className="flex flex-col gap-4 mt-10 max-w-4xl mx-auto">
            {education.map((edu, index) => (

              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedEducation(edu)}
                className="cursor-pointer group relative"
              >
                  {/* Highlight Glow for Current Education */}
                  {edu.is_current && (
                    <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary-cyan/50 via-primary-emerald/30 to-primary-cyan/50 opacity-20 blur-sm pointer-events-none" />
                  )}

                  <div className={`
                    p-4 rounded-xl border transition-all flex items-center gap-5 relative overflow-hidden
                    ${edu.is_current 
                      ? 'border-l-4 border-l-primary-cyan border-y-primary-cyan/20 border-r-primary-cyan/20 bg-gradient-to-r from-primary-cyan/5 to-transparent dark:from-primary-cyan/10 dark:to-transparent shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                      : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] shadow-sm dark:shadow-none'
                    }
                  `}>
                      {/* Current Status Badge for Current Education */}
                      {edu.is_current && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-primary-cyan text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                            CURRENT
                          </div>
                        </div>
                      )}

                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {(edu.institution_logo_url || edu.institution_logo) ? (
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 overflow-hidden">
                            <img 
                              src={edu.institution_logo_url || edu.institution_logo} 
                              alt={edu.institution_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/10 flex items-center justify-center text-3xl shadow-inner">
                            🎓
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-cyan transition-colors truncate">
                            {edu.degree_name}
                          </h3>
                          <div className="mt-1">
                             <div className="flex items-start justify-between">
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium truncate">
                                  {edu.institution_name}
                                </p>
                                <span className="text-[10px] text-primary-cyan font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block ml-2">
                                  Click for Details ↗
                                </span>
                             </div>
                             
                             <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out w-full">
                                <div className="overflow-hidden">
                                   {edu.location && (
                                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                         📍 {edu.location}
                                      </p>
                                   )}
                                </div>
                             </div>
                          </div>
                      </div>
                      
                      {/* Mobile Arrow */}
                      <div className="text-primary-cyan opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
                        →
                      </div>
                  </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Experience Section */}
      {experience?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="experience">
          <SectionTitle subtitle="Roles, organizations &amp; highlights"> Experience </SectionTitle>
          <div className="mt-10 relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-emerald-500/20 to-transparent hidden md:block" />
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <motion.div
                  key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="md:pl-16 relative"
                >
                  <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 border-2 border-white dark:border-dark-base z-10 hidden md:block" />
                  <div className={`relative bg-white/50 dark:bg-white/[0.03] border rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all group ${exp.highlight ? "border-amber-500/30 hover:border-amber-500/50" : "border-slate-200 dark:border-white/10"}`}>
                    {exp.highlight && <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">⭐</span>}
                    <div className="flex items-start gap-4">
                      {exp.logo_url ? (
                        <img src={exp.logo_url} alt={exp.organization || exp.role} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl flex-shrink-0 mt-0.5">💼</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-emerald-500 transition-all">{exp.role}</h3>
                        {exp.organization && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{exp.organization}</p>}
                        {exp.duration && <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">🕐 {exp.duration}</span>}
                        {exp.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{exp.description}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Achievements Section */}
      {achievements?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="achievements">
          <SectionTitle subtitle="Awards, certifications &amp; accolades"> Achievements </SectionTitle>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((a, idx) => (
              <motion.div
                key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all group"
              >
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl" />
                <div className="flex items-start gap-4">
                  {a.badge_image_url ? (
                    <img src={a.badge_image_url} alt={a.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-slate-200 dark:border-white/10 flex items-center justify-center text-3xl flex-shrink-0">🏆</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{a.title}</h3>
                    {a.issuer && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.issuer}</p>}
                    {a.date && <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-500">📅 {new Date(a.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}</span>}
                  </div>
                </div>
                {a.certificate_link && (
                  <a href={a.certificate_link} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-all">
                    View Certificate ↗
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Feedback & Reviews Section */}
      {feedbacks?.length >= 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto overflow-hidden">
          <SectionTitle subtitle="Voices of My Well‑Wishers">
             Feedback & Reviews
          </SectionTitle>

          <div className="relative mt-12 group/carousel">
             {/* Left Arrow */}
             <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-cyan-500 hover:border-cyan-500 disabled:opacity-0 hidden md:block translate-x-1/2"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>

             {/* Scroll Container */}
             <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             >
                {feedbacks.map((fb, index) => (
                   <motion.div 
                      key={fb.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="min-w-[300px] md:min-w-[350px] snap-center h-[320px]"
                   >
                      <FeedbackCard 
                         fb={fb} 
                         onClick={() => setReviewsOpen(true)}
                      />
                   </motion.div>
                ))}
             </div>

             {/* Right Arrow */}
             <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-cyan-500 hover:border-cyan-500 hidden md:block -translate-x-1/2"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>

          <div className="flex flex-wrap justify-center mt-8 gap-4">
             <button 
                onClick={() => setReviewsOpen(true)}
                className="px-8 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white font-semibold hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary-cyan/50 dark:hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-md flex items-center gap-2 group"
             >
                View All {feedbacks.length} Reviews
             </button>
             
             <GlowButton onClick={() => setFeedbackOpen(true)}>
                <span className="group-hover:scale-110 transition-transform mr-2">✍️</span> 
                Leave a Review
             </GlowButton>
          </div>
        </AnimatedSection>
      )}

      {/* Education Detail Modal */}
      <AnimatePresence>
        {selectedEducation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEducation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header Image/Pattern */}
              <div className="h-32 bg-gradient-to-r from-cyan-900/40 to-emerald-900/40 relative overflow-hidden shrink-0">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                 <button 
                    onClick={() => setSelectedEducation(null)}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/10 z-10"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>

              {/* Content Body */}
              <div className="p-8 -mt-12 relative flex-1 overflow-y-auto custom-scrollbar">
                 <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1e293b] border-2 border-cyan-500/30 shadow-xl mb-6 relative group overflow-hidden"
                    >
                       {(selectedEducation.institution_logo_url || selectedEducation.institution_logo) ? (
                          <img 
                            src={selectedEducation.institution_logo_url || selectedEducation.institution_logo} 
                            alt={selectedEducation.institution_name}
                            className="w-full h-full object-cover"
                          />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🎓</div>
                       )}
                       {selectedEducation.is_current && (
                         <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 z-10">
                           CURRENT
                         </span>
                       )}
                    </motion.div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedEducation.degree_name}</h2>
                    <p className="text-lg text-cyan-600 dark:text-cyan-400 font-medium mb-1">{selectedEducation.institution_name}</p>
                    {selectedEducation.location && (
                       <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-1">
                          📍 {selectedEducation.location}
                       </p>
                    )}
                    {!selectedEducation.location && <div className="mb-6" />}
                    
                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
                       <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/10">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Timeline</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                             {selectedEducation.start_date ? formatDate(selectedEducation.start_date) : ''} — {selectedEducation.is_current ? (selectedEducation.end_date ? formatDate(selectedEducation.end_date) : "Present") : (selectedEducation.end_date ? formatDate(selectedEducation.end_date) : '')}
                          </p>
                       </div>
                       {selectedEducation.result && (
                         <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">GPA / CGPA</p>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                               {selectedEducation.result}
                            </p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Description */}
                 {selectedEducation.description && (
                   <div className="mb-8 bg-slate-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-cyan-500 rounded-full"/> Overview
                      </h4>
                      <div className="prose prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {selectedEducation.description}
                      </div>
                   </div>
                 )}

                 {/* Certificate Section */}
                 {selectedEducation.certificate && (
                   <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-1 h-4 bg-amber-500 rounded-full"/> Credentials
                      </h4>
                      
                      <div className="bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group relative mt-4">
                        {/* Download Button (Overlay) - Always visible on mobile, hover on desktop */}
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                             <a 
                               href={getMediaUrl(selectedEducation.certificate)} 
                               download
                               target="_blank" 
                               rel="noreferrer"
                               className="bg-black/80 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all backdrop-blur-md border border-white/20 shadow-xl"
                             >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Download File</span>
                             </a>
                        </div>
                   
                        {/* Image Preview */}
                        <div className="relative flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                          <img 
                            src={getMediaUrl(selectedEducation.certificate)} 
                            alt="Certificate Preview" 
                            className="w-full h-auto object-cover rounded shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
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

      <HireDrawer 
        isOpen={hireOpen} 
        onClose={() => setHireOpen(false)} 
      />
    </div>
  );
}
