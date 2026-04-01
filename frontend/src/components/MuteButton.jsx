import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "../contexts/SoundContext";
import { useTheme } from "../contexts/ThemeContext";

export default function MuteButton() {
  const sound = useSound();
  const { theme, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show notification only once per session
    const shown = sessionStorage.getItem("sound_notification_shown");
    if (!shown) {
      // Delay slightly so it pops up after page load
      const t1 = setTimeout(() => setShowTooltip(true), 1000);
      // Hide after 3 seconds
      const t2 = setTimeout(() => {
        setShowTooltip(false);
        sessionStorage.setItem("sound_notification_shown", "true");
      }, 5000); // 1s delay + 4s show = 5s total until verify hidden

      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  if (!sound) return null;
  const { isMuted, toggleMute } = sound;

  return (
    <div className="fixed bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 z-[9999] flex items-center gap-2 sm:gap-3">
      <AnimatePresence>
        {showTooltip && isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="relative bg-white/10 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-white shadow-xl max-w-[140px] sm:max-w-[150px] text-center"
          >
            Want to hear sounds? <span className="text-cyan-400">Unmute</span> below!
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-4 border-transparent border-t-white/20" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleMute}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.88 }}
        className="w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-sm sm:text-base md:text-lg hover:bg-white/10 hover:border-white/40 transition-colors"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
        aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isMuted ? "muted" : "unmuted"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isMuted ? "🔇" : "🔊"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <motion.button
        onClick={toggleTheme}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.88 }}
        className="w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-sm sm:text-base md:text-lg hover:bg-white/10 hover:border-white/40 transition-colors"
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme === "dark" ? "dark" : "light"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
