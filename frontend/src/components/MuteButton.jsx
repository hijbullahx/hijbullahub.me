import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "../contexts/SoundContext";

export default function MuteButton() {
  const sound = useSound();
  if (!sound) return null;
  const { isMuted, toggleMute } = sound;

  return (
    <motion.button
      onClick={toggleMute}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.88 }}
      className="fixed bottom-6 right-6 z-[9999] w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-lg hover:bg-white/10 hover:border-white/40 transition-colors"
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
  );
}
