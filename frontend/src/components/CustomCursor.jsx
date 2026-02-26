import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

// angles for the 16 primary spark rays
const SPARK_ANGLES = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
// jagged alternating lengths for a chaotic plasma look
const SPARK_LENGTHS = [70, 42, 80, 35, 75, 48, 85, 38, 72, 44, 78, 36, 68, 50, 82, 40];
// secondary burst — offset angles
const BURST2_ANGLES = [11, 56, 101, 146, 191, 236, 281, 326];
const BURST2_LENGTHS = [52, 38, 60, 45, 55, 34, 58, 42];

function Explosion({ x, y, onDone }) {
  return (
    <motion.div
      className="pointer-events-none fixed z-[10000]"
      style={{ top: y, left: x }}
      onAnimationComplete={onDone}
    >
      {/* Blinding core flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 22, height: 22,
          top: -11, left: -11,
          background: "radial-gradient(circle, #fff 15%, #22d3ee 45%, #06b6d4 70%, transparent 90%)",
          boxShadow: "0 0 24px 10px #22d3ee, 0 0 48px 20px #0891b2, 0 0 80px 30px #0e7490",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3.5, 0.5, 0], opacity: [1, 1, 0.6, 0] }}
        transition={{ duration: 0.55, ease: [0.1, 0.9, 0.3, 1] }}
      />

      {/* Secondary hot core — slightly warm tint */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 10, height: 10,
          top: -5, left: -5,
          background: "radial-gradient(circle, #fff 30%, #a5f3fc 70%, transparent 100%)",
          boxShadow: "0 0 16px 8px #fff, 0 0 32px 12px #22d3ee",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 4, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      />

      {/* Shockwave ring 1 — big, fast */}
      <motion.div
        className="absolute rounded-full"
        style={{
          border: "2px solid #22d3ee",
          boxShadow: "0 0 8px 2px #06b6d4, inset 0 0 8px 2px #06b6d4",
          top: 0, left: 0,
        }}
        initial={{ width: 0, height: 0, top: 0, left: 0, opacity: 1 }}
        animate={{ width: 110, height: 110, top: -55, left: -55, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Shockwave ring 2 — emerald, delayed */}
      <motion.div
        className="absolute rounded-full"
        style={{
          border: "1.5px solid #34d399",
          boxShadow: "0 0 6px 2px #10b981",
          top: 0, left: 0,
        }}
        initial={{ width: 0, height: 0, top: 0, left: 0, opacity: 0.9 }}
        animate={{ width: 80, height: 80, top: -40, left: -40, opacity: 0 }}
        transition={{ duration: 0.42, ease: "easeOut", delay: 0.07 }}
      />

      {/* Shockwave ring 3 — white, fast micro-pulse */}
      <motion.div
        className="absolute rounded-full border border-white/80"
        style={{ top: 0, left: 0 }}
        initial={{ width: 0, height: 0, top: 0, left: 0, opacity: 1 }}
        animate={{ width: 44, height: 44, top: -22, left: -22, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.02 }}
      />

      {/* Primary spark rays × 16 */}
      {SPARK_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * SPARK_LENGTHS[i];
        const ty = Math.sin(rad) * SPARK_LENGTHS[i];
        const isCyan = i % 2 === 0;
        const thick = i % 4 === 0 ? 4 : i % 2 === 0 ? 3 : 2;
        return (
          <motion.div
            key={`p${angle}`}
            className="absolute rounded-full"
            style={{
              width: thick, height: thick,
              top: -thick / 2, left: -thick / 2,
              background: isCyan ? "#e0f2fe" : "#d1fae5",
              boxShadow: isCyan
                ? `0 0 ${thick * 4}px ${thick * 2}px #06b6d4, 0 0 ${thick * 8}px ${thick * 2}px #0891b2`
                : `0 0 ${thick * 4}px ${thick * 2}px #10b981, 0 0 ${thick * 8}px ${thick * 2}px #059669`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
            animate={{
              x: [0, tx * 0.3, tx * 0.8, tx],
              y: [0, ty * 0.3, ty * 0.8, ty],
              opacity: [1, 1, 0.8, 0],
              scale: [1.5, 2, 1, 0],
            }}
            transition={{
              duration: 0.52,
              delay: i * 0.008,
              ease: [0.05, 0.95, 0.4, 1],
            }}
          />
        );
      })}

      {/* Secondary burst × 8 (staggered, longer hang) */}
      {BURST2_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * BURST2_LENGTHS[i];
        const ty = Math.sin(rad) * BURST2_LENGTHS[i];
        return (
          <motion.div
            key={`b${angle}`}
            className="absolute rounded-full"
            style={{
              width: 3, height: 3,
              top: -1.5, left: -1.5,
              background: i % 2 === 0 ? "#67e8f9" : "#6ee7b7",
              boxShadow: i % 2 === 0
                ? "0 0 8px 3px #06b6d4"
                : "0 0 8px 3px #10b981",
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: [0, tx * 0.5, tx],
              y: [0, ty * 0.5, ty],
              opacity: [1, 0.9, 0],
              scale: [1, 1.8, 0],
            }}
            transition={{ duration: 0.6, delay: 0.04 + i * 0.012, ease: "easeOut" }}
          />
        );
      })}

      {/* Debris scatter — 12 tiny white/cyan pixels */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360 + 15;
        const rad = (angle * Math.PI) / 180;
        const len = 18 + (i % 5) * 8;
        return (
          <motion.div
            key={`d${i}`}
            className="absolute rounded-full bg-white"
            style={{ width: 2, height: 2, top: -1, left: -1,
              boxShadow: "0 0 4px 2px #e0f2fe" }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * len,
              y: Math.sin(rad) * len,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.38, delay: 0.03 + i * 0.005, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [explosions, setExplosions] = useState([]);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const removeExplosion = useCallback((id) => {
    setExplosions((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
    };
    const handleClick = (e) => {
      const id = Date.now() + Math.random();
      setExplosions((prev) => [...prev.slice(-8), { id, x: e.clientX, y: e.clientY }]);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("click", handleClick);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Click plasma explosions */}
      <AnimatePresence>
        {explosions.map((e) => (
          <Explosion key={e.id} x={e.x} y={e.y} onDone={() => removeExplosion(e.id)} />
        ))}
      </AnimatePresence>

      {/* Outer glow ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: "40px",
          height: "40px",
        }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary-cyan/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-primary-cyan rounded-full" />
          <div className="absolute bottom-0 left-1/2 w-1 h-1 -ml-0.5 -mb-0.5 bg-primary-emerald rounded-full" />
        </motion.div>
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-primary-emerald/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary-cyan shadow-lg shadow-primary-cyan/50" />
        
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/60 to-transparent" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-emerald/60 to-transparent" />
      </motion.div>
    </>
  );
}
