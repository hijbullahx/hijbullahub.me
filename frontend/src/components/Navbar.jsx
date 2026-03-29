import { motion } from "framer-motion";
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const links = [
  ["/", "Home"],
  ["/projects", "Projects"],
  ["/ai-ml", "AI/ML"],
  ["/research", "Research"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "backdrop-blur-3xl shadow-2xl shadow-primary-cyan/10"
          : "backdrop-blur-xl"
      } ${theme === 'dark' ? 'bg-dark-base/98 dark:bg-dark-base/98' : 'bg-white/95 light:bg-white/95'}`}
      style={{
        borderBottom: scrolled 
          ? theme === 'dark' 
            ? '1px solid rgba(34, 211, 238, 0.3)' 
            : '1px solid rgba(34, 211, 238, 0.2)'
          : theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.05)'
            : '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Animated moving gradient background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(90deg, #22d3ee, #10b981, #22d3ee)',
          backgroundSize: '300% 300%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated gradient border at top with glow */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.8), rgba(16, 185, 129, 0.8), rgba(34, 211, 238, 0.8), transparent)',
          backgroundSize: '200% 100%',
          filter: 'blur(1px)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 0%'],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          backgroundPosition: {
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          },
          opacity: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }
        }}
      />

      <nav className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-700 ${
        scrolled ? "py-3" : "py-6"
      }`}>
        {/* Logo with cinematic effects */}
        <Link to="/" className="no-underline">
          <motion.div
            whileHover={{ scale: 1.05 }}
            animate={{ 
              scale: scrolled ? 0.95 : 1,
            }}
            transition={{ duration: 0.5 }}
            className="relative group cursor-pointer"
          >
            {/* Background glow with moving gradient */}
            <motion.div 
              className="absolute -inset-4 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(16, 185, 129, 0.4), rgba(34, 211, 238, 0.4))',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <motion.h1
              className={`relative font-black tracking-tight transition-all duration-500 ${
                scrolled ? "text-2xl" : "text-3xl"
              }`}
              whileHover={{ letterSpacing: "0.05em" }}
              transition={{ duration: 0.3 }}
            >
              {/* Hijbullah with animated gradient */}
              <motion.span 
                className="relative bg-clip-text text-transparent font-extrabold"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #22d3ee, #10b981, #22d3ee)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Hijbullah
              </motion.span>

              {/* Hub with animated gradient - different color */}
              <motion.span 
                className="relative bg-clip-text text-transparent font-extrabold"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #2C2C2C, #32CD32, #F8F8F8)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Hub
              </motion.span>
              
              {/* Animated underline with glow */}
              <motion.div
                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #10b981)',
                  boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)',
                }}
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.h1>
          </motion.div>
        </Link>

        {/* Hamburger Menu Button (Mobile only) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative group p-2 z-50"
          aria-label="Toggle menu"
        >
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(16, 185, 129, 0.15))',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              border: '1px solid rgba(34, 211, 238, 0.5)',
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
            }}
          />
          <div className="relative w-6 h-5 flex flex-col justify-center gap-1.5">
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-full h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)' }}
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              className="w-full h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="w-full h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)' }}
            />
          </div>
        </button>

        {/* Navigation links with enhanced robotic effects (Desktop only) */}
        <div className="hidden md:flex gap-3">
          {links.map(([to, label], idx) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ 
                    delay: idx * 0.1, 
                    duration: 0.5,
                    scale: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                  className="relative group px-5 py-2.5"
                >
                  {/* Robotic frame background with sharp edges */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(16, 185, 129, 0.15))',
                      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                      border: '1px solid rgba(34, 211, 238, 0)',
                      boxShadow: '0 0 0 rgba(34, 211, 238, 0)',
                    }}
                    whileHover={{
                      border: '1px solid rgba(34, 211, 238, 0.5)',
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.1)',
                    }}
                  />

                  {/* Corner brackets - top left & bottom right */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-cyan opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-emerald opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Scan line effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30"
                    style={{
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.1) 2px, rgba(34, 211, 238, 0.1) 4px)',
                    }}
                    animate={{
                      y: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  
                  {/* Text with robotic styling */}
                  <motion.span
                    className={`relative text-base font-bold tracking-widest uppercase transition-all duration-300 ${
                      isActive
                        ? "text-transparent bg-clip-text"
                        : theme === 'dark' 
                          ? "text-slate-200 group-hover:text-white"
                          : "text-slate-700 group-hover:text-slate-900"
                    }`}
                    style={isActive ? {
                      backgroundImage: 'linear-gradient(90deg, #22d3ee, #10b981)',
                      fontFamily: 'monospace',
                    } : {
                      fontFamily: 'monospace',
                    }}
                    whileHover={{ 
                      y: -2,
                      textShadow: '0 0 12px rgba(34, 211, 238, 0.6)',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {label}
                  </motion.span>

                  {/* Angular underline with glow */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{
                      background: 'linear-gradient(90deg, #22d3ee, #10b981)',
                      clipPath: 'polygon(0 50%, 5px 0, calc(100% - 5px) 0, 100% 50%, calc(100% - 5px) 100%, 5px 100%)',
                      originX: 0.5,
                    }}
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0,
                      opacity: isActive ? 1 : 0,
                      boxShadow: isActive ? '0 0 12px rgba(34, 211, 238, 0.7)' : '0 0 0 rgba(34, 211, 238, 0)',
                    }}
                    whileHover={{
                      scaleX: 1,
                      opacity: 1,
                      boxShadow: '0 0 18px rgba(34, 211, 238, 0.9)',
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Active indicator - hexagon shape */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 left-1/2 w-2 h-2 bg-primary-cyan"
                      style={{ 
                        x: "-50%",
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                        boxShadow: '0 0 12px rgba(34, 211, 238, 1), 0 0 24px rgba(34, 211, 238, 0.5)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 12px rgba(34, 211, 238, 1), 0 0 24px rgba(34, 211, 238, 0.5)',
                          '0 0 18px rgba(34, 211, 238, 1), 0 0 36px rgba(34, 211, 238, 0.7)',
                          '0 0 12px rgba(34, 211, 238, 1), 0 0 24px rgba(34, 211, 238, 0.5)',
                        ],
                        rotate: [0, 120, 240, 360],
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        boxShadow: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        rotate: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }
                      }}
                    />
                  )}

                  {/* Digital grid overlay on active */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.3) 0px, transparent 1px, transparent 2px, rgba(34, 211, 238, 0.3) 3px), repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0px, transparent 1px, transparent 2px, rgba(34, 211, 238, 0.3) 3px)',
                        backgroundSize: '4px 4px',
                      }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}

          {/* Admin Button - Dashboard Link */}
          <Link 
            to="/dashboard"
            className="no-underline"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1 }}
              transition={{ 
                delay: links.length * 0.1, 
                duration: 0.5,
                scale: {
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }
              }}
              className="relative group px-5 py-2.5"
            >
              {/* Robotic frame background with sharp edges - purple/pink theme */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  border: '1px solid rgba(168, 85, 247, 0)',
                  boxShadow: '0 0 0 rgba(168, 85, 247, 0)',
                }}
                whileHover={{
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(236, 72, 153, 0.1)',
                }}
              />

              {/* Corner brackets - purple theme */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500 opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-500 opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Scan line effect - purple tint */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-30"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168, 85, 247, 0.1) 2px, rgba(168, 85, 247, 0.1) 4px)',
                }}
                animate={{
                  y: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Admin icon + text */}
              <motion.span
                className={`relative text-base font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'text-slate-200 group-hover:text-white' 
                    : 'text-slate-700 group-hover:text-slate-900'
                }`}
                style={{
                  fontFamily: 'monospace',
                }}
                whileHover={{ 
                  y: -2,
                  textShadow: '0 0 12px rgba(168, 85, 247, 0.6)',
                  letterSpacing: '0.2em',
                }}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                  />
                </svg>
                Admin
              </motion.span>

              {/* Angular underline with purple glow */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{
                  background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                  clipPath: 'polygon(0 50%, 5px 0, calc(100% - 5px) 0, 100% 50%, calc(100% - 5px) 100%, 5px 100%)',
                  originX: 0.5,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{
                  scaleX: 1,
                  opacity: 1,
                  boxShadow: '0 0 18px rgba(168, 85, 247, 0.9)',
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Bottom gradient line with glow */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.6), rgba(16, 185, 129, 0.6), rgba(34, 211, 238, 0.6), transparent)',
          filter: 'blur(0.5px)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mobile Menu Dropdown */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden"
        style={{
          background: theme === 'dark' ? 'rgba(11, 15, 25, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(34, 211, 238, 0.2)',
        }}
      >
        <nav className="px-6 py-4 space-y-2">
          {links.map(([to, label], idx) => (
            <NavLink 
              key={to} 
              to={to}
              onClick={() => setMobileMenuOpen(false)}
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="relative group py-3 px-4"
                >
                  {/* Background with robotic frame */}
                  <motion.div 
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(16, 185, 129, 0.2))'
                        : 'rgba(34, 211, 238, 0.05)',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      border: isActive ? '1px solid rgba(34, 211, 238, 0.5)' : '1px solid rgba(34, 211, 238, 0.1)',
                      boxShadow: isActive ? '0 0 15px rgba(34, 211, 238, 0.3)' : 'none',
                    }}
                  />

                  {/* Corner brackets */}
                  <div className={`absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-primary-cyan transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                  <div className={`absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-primary-emerald transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                  
                  {/* Text */}
                  <span
                    className={`relative text-base font-bold tracking-widest uppercase transition-all duration-300 ${
                      isActive
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500"
                        : theme === 'dark' 
                          ? "text-slate-200"
                          : "text-slate-700"
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {label}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-emerald-500"
                      style={{ 
                        y: "-50%",
                        boxShadow: '0 0 12px rgba(34, 211, 238, 0.8)',
                      }}
                      layoutId="mobileActiveIndicator"
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}

          {/* Admin Link - Mobile */}
          <Link 
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="no-underline"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: (links.length + 1) * 0.05, duration: 0.3 }}
              className="relative group py-3 px-4"
            >
              <motion.div 
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              />

              <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-purple-500 opacity-40" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-pink-500 opacity-40" />
              
              <div className="relative flex items-center gap-2">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                  />
                </svg>
                <span
                  className={`text-base font-bold tracking-widest uppercase ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  ADMIN
                </span>
              </div>
            </motion.div>
          </Link>
        </nav>
      </motion.div>
    </motion.header>
  );
}
