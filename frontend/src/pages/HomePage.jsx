import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchList } from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import ErrorState from "../components/ErrorState";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import HoverTiltCard from "../components/HoverTiltCard";
import LoadingState from "../components/LoadingState";
import ParticleBackground from "../components/ParticleBackground";
import SectionTitle from "../components/SectionTitle";
import TypingAnimation from "../components/TypingAnimation";

export default function HomePage() {
  const [state, setState] = useState({ loading: true, error: "", data: {} });
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [hero, about, skills] = await Promise.all([
          fetchList("/hero/"),
          fetchList("/about/"),
          fetchList("/skills/"),
        ]);

        setState({
          loading: false,
          error: "",
          data: {
            hero: hero.find((h) => h.is_active) ?? hero[0],
            about: about[0],
            skills,
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

  const { hero, about, skills } = state.data;

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
    </div>
  );
}
