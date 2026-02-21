import { motion } from "framer-motion";
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const links = [
  ["/", "Home"],
  ["/projects", "Projects"],
  ["/blog", "Blog"],
  ["/research", "Research"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                  backgroundImage: 'linear-gradient(90deg, #a855f7, #ec4899, #a855f7)',
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

        {/* Navigation links with enhanced robotic effects */}
        <div className="flex gap-3">
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

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              delay: links.length * 0.1 + 0.05, 
              duration: 0.5,
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            className="relative group px-4 py-2.5 text-2xl"
            aria-label="Toggle theme"
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

            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            
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
            
            {/* Theme emoji with rotation animation */}
            <motion.span
              className="relative block"
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))',
              }}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </motion.span>

            {/* Circular glow pulse on hover */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 1.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>

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
    </motion.header>
  );
}
