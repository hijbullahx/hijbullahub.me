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

// ── Swipeable feedback card (book-page flip) ──────────────────────────────
function FeedbackCard({ fb, canLeft, canRight, onSwipeLeft, onSwipeRight, onClick, totalCount, index }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 0, 180], [-12, 0, 12]);
  const opacity = useTransform(x, [-150, -60, 0, 60, 150], [0, 0.85, 1, 0.85, 0]);
  const didDrag = useRef(false);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      dragMomentum={false}
      style={{ x, rotate, opacity, touchAction: "none" }}
      onDragStart={() => { didDrag.current = false; }}
      onDrag={(_, info) => { if (Math.abs(info.offset.x) > 5) didDrag.current = true; }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80 && canLeft) onSwipeLeft();
        else if (info.offset.x > 80 && canRight) onSwipeRight();
      }}
      onPointerUp={() => { if (!didDrag.current) onClick?.(); }}
      className="absolute inset-0 rounded-2xl bg-[#0d1117]/90 border border-white/10
        backdrop-blur-md p-5 cursor-pointer select-none
        hover:border-cyan-500/40 transition-[border-color] duration-300 flex flex-col"
    >
      {/* Glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-emerald-500/8 blur-2xl pointer-events-none" />

      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className="w-4 h-4" viewBox="0 0 24 24"
            fill={s <= fb.rating ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth={1.5}
            style={{ color: s <= fb.rating ? "#f59e0b" : "rgba(255,255,255,0.15)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
        {/* Only show '1/Count' if there is more than 1 feedback */}
        {totalCount > 1 && (
          <span className="ml-auto text-xs text-gray-500">
            {index + 1}/{totalCount}
          </span>
        )}
      </div>

      {/* Comment */}
      <p className="text-slate-300 text-sm leading-relaxed flex-1 line-clamp-5 mb-4">
        &ldquo;{fb.comment}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {fb.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{fb.name}</p>
          <div className="flex flex-col">
            {fb.profession && (
              <p className="text-[10px] text-cyan-400 font-medium truncate mb-0.5">{fb.profession}</p>
            )}
            <p className="text-[10px] text-gray-500 hidden sm:block">{new Date(fb.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Edge arrows hint */}
      {canRight && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/30 text-lg select-none pointer-events-none">‹</span>
      )}
      {canLeft && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/30 text-lg select-none pointer-events-none">›</span>
      )}
      {/* Tap hint */}
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 select-none pointer-events-none tracking-wide">
        tap to view all
      </span>
    </motion.div>
  );
}

export default function HomePage() {
  const [state, setState] = useState({ loading: true, error: "", data: {} });
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hireOpen, setHireOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const wheelCooldown = useRef(false);

  useEffect(() => {
    const loadFeedbacks = () =>
      fetchList("/feedback/").then((data) => setFeedbacks(data.filter((f) => f.is_visible))).catch(() => {});

    loadFeedbacks();

    // Re-fetch whenever user returns to this tab so hidden items disappear immediately
    const onVisible = () => { if (document.visibilityState === "visible") loadFeedbacks(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [hero, about, skills, experience, achievements] = await Promise.all([
          fetchList("/hero/"),
          fetchList("/about/"),
          fetchList("/skills/"),
          fetchList("/experience/"),
          fetchList("/achievements/"),
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
          },
        });
      } catch {
        setState({ loading: false, error: "Unable to load homepage data.", data: {} });
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);


  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { hero, about, skills, experience, achievements } = state.data;

  // Calculate angle for mouse icon to follow cursor
  const iconX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const iconY = typeof window !== 'undefined' ? window.innerHeight - 64 : 0;
  const angle = Math.atan2(mousePos.y - iconY, mousePos.x - iconX) * (180 / Math.PI);
  const mouseAngle = angle + 90; // Adjust for vertical icon orientation

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
                <GlowButton onClick={() => setHireOpen(true)}>
                  💼 Engage My Expertise
                </GlowButton>
                <motion.button
                  onClick={() => setFeedbackOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 rounded-full border-2 border-primary-cyan/30 text-primary-cyan font-semibold hover:bg-primary-cyan/10 transition-all duration-300"
                >
                  ⭐ Feedback
                </motion.button>
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
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: `translateX(-50%)`,
            zIndex: 50,
          }}
        >
          <motion.div
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-6 h-10 border-2 border-primary-cyan/50 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-dark-base/30"
          >
            <motion.div 
              className="w-1 h-2 bg-primary-cyan rounded-full"
              animate={{
                rotate: mouseAngle * 0.2,
              }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 15,
              }}
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
            <p className="text-slate-300 leading-relaxed">{about?.mission_statement}</p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-2xl font-bold gradient-text mb-4">Vision</h3>
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
                <div className="relative w-24 h-24 mx-auto mb-4 flex-shrink-0">
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
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    {skill.icon ? (
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-full h-full object-cover rounded-full drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                      />
                    ) : (
                      <span className="text-2xl font-bold gradient-text">{skill.level}</span>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-1">{skill.name}</h4>
                <p className="text-sm text-slate-400">{skill.category}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Experience Section */}
      {experience?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="experience">
          <SectionTitle subtitle="Roles, organizations &amp; highlights">
            Experience
          </SectionTitle>
          <div className="mt-10 relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-emerald-500/20 to-transparent hidden md:block" />

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="md:pl-16 relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 border-2 border-dark-base z-10 hidden md:block" />

                  <div className={`relative bg-white/[0.03] border rounded-2xl p-5 hover:border-white/20 transition-all group ${
                    exp.highlight ? "border-amber-500/30 hover:border-amber-500/50" : "border-white/10"
                  }`}>
                    {exp.highlight && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        ⭐ Highlight
                      </span>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      {exp.logo_url ? (
                        <img
                          src={exp.logo_url}
                          alt={exp.organization || exp.role}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0 mt-0.5">
                          💼
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 transition-all">
                          {exp.role}
                        </h3>
                        {exp.organization && (
                          <p className="text-sm text-slate-400 mt-0.5">{exp.organization}</p>
                        )}
                        {exp.duration && (
                          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-400">
                            🕐 {exp.duration}
                          </span>
                        )}
                        {exp.description && (
                          <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-3">
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

      {/* Achievements Section */}
      {achievements?.length > 0 && (
        <AnimatedSection className="section-padding max-w-7xl mx-auto" id="achievements">
          <SectionTitle subtitle="Awards, certifications &amp; accolades">
            Achievements
          </SectionTitle>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((a, idx) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all group"
              >
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl" />

                <div className="flex items-start gap-4">
                  {a.badge_image_url ? (
                    <img
                      src={a.badge_image_url}
                      alt={a.title}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                      🏆
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-snug group-hover:text-amber-400 transition-colors">
                      {a.title}
                    </h3>
                    {a.issuer && (
                      <p className="text-xs text-slate-400 mt-1">{a.issuer}</p>
                    )}
                    {a.date && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-500">
                        📅 {new Date(a.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>

                {a.certificate_link && (
                  <a
                    href={a.certificate_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-all"
                  >
                    View Certificate ↗
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      )}

      <HireDrawer isOpen={hireOpen} onClose={() => setHireOpen(false)} />

      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
        />
      )}

      {/* Feedback Section */}
      <AnimatedSection className="section-padding max-w-7xl mx-auto pb-24">
        <SectionTitle subtitle="What visitors are saying">
          Feedback &amp; Reviews
        </SectionTitle>

        {feedbacks.length > 0 ? (
          <div className="mt-10 flex flex-col items-center">
            {/* Swipe hint */}
            <p className="text-xs text-gray-500 mb-6 tracking-wide select-none">
              ‹ Swipe or scroll over the card to flip through reviews ›
            </p>

            {/* Card stack — book pages */}
            <div
              className="relative w-full max-w-sm"
              style={{ height: "300px" }}
              onWheel={(e) => {
                if (wheelCooldown.current) return;
                wheelCooldown.current = true;
                setTimeout(() => { wheelCooldown.current = false; }, 500);
                if (e.deltaY > 0) setCardIdx((i) => Math.min(feedbacks.length - 1, i + 1));
                else setCardIdx((i) => Math.max(0, i - 1));
              }}
            >

              {/* Back shadow cards (depth effect) */}
              {[2, 1].map((depth) => {
                const bgFb = feedbacks[cardIdx + depth];
                if (!bgFb) return null;
                return (
                  <motion.div
                    key={`depth-${depth}`}
                    animate={{ scale: 1 - depth * 0.05, y: depth * 14 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="absolute inset-0 rounded-2xl bg-[#0d1117]/80 border border-white/10 p-5 pointer-events-none overflow-hidden"
                    style={{ opacity: 0.35 + (2 - depth) * 0.2 }}
                  >
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 24 24"
                          fill={s <= bgFb.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}
                          style={{ color: s <= bgFb.rating ? "#f59e0b" : "rgba(255,255,255,0.1)" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-3">&ldquo;{bgFb.comment}&rdquo;</p>
                  </motion.div>
                );
              })}

              {/* Front card — draggable */}
              <AnimatePresence mode="wait">
                {feedbacks[cardIdx] && (
                  <FeedbackCard
                    key={cardIdx}
                    fb={feedbacks[cardIdx]}
                    totalCount={feedbacks.length}
                    index={cardIdx}
                    canLeft={cardIdx < feedbacks.length - 1}
                    canRight={cardIdx > 0}
                    onSwipeLeft={() => setCardIdx((i) => i + 1)}
                    onSwipeRight={() => setCardIdx((i) => i - 1)}
                    onClick={() => setReviewsOpen(true)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => setCardIdx((i) => Math.max(0, i - 1))}
                disabled={cardIdx === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                ‹
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {feedbacks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCardIdx(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === cardIdx
                        ? "w-5 h-1.5 bg-cyan-400"
                        : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCardIdx((i) => Math.min(feedbacks.length - 1, i + 1))}
                disabled={cardIdx === feedbacks.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                ›
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {cardIdx + 1} of {feedbacks.length}
            </p>
          </div>
        ) : (
          <div className="mt-10 text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
            <p className="text-5xl mb-4">💬</p>
            <p className="text-slate-400 text-lg mb-2">No feedback yet.</p>
            <p className="text-slate-500 text-sm">Be the first to share your thoughts!</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <motion.button
            onClick={() => setReviewsOpen(true)}
            whileHover={{ scale: 1.05 }}
            className="px-7 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            📋 View All Reviews
          </motion.button>
          <motion.button
            onClick={() => setFeedbackOpen(true)}
            whileHover={{ scale: 1.05 }}
            className="px-7 py-3 rounded-full border-2 border-primary-cyan/30 text-primary-cyan font-semibold hover:bg-primary-cyan/10 transition-all duration-300"
          >
            ⭐ Leave Your Feedback
          </motion.button>
        </div>
      </AnimatedSection>

      {/* Reviews sidebar drawer */}
      <ReviewsDrawer
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        feedbacks={feedbacks}
        onLeaveFeedback={() => setFeedbackOpen(true)}
      />
    </div>
  );
}
