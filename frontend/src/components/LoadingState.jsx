import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function LoadingState({ statusText = "Loading" }) {
  const brand = "HijbullahHub";
  const letters = useMemo(() => brand.split(""), [brand]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const typingTimer = setInterval(() => {
      setVisibleCount((prev) => (prev < letters.length ? prev + 1 : prev));
    }, 130);

    return () => clearInterval(typingTimer);
  }, [letters.length]);

  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 420);

    return () => clearInterval(dotsTimer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full min-h-[62vh] sm:min-h-[66vh] flex items-center justify-center"
    >
      <div className="w-full max-w-2xl text-center px-8 sm:px-12 py-10 rounded-2xl border border-cyan-500/15 bg-white/5 dark:bg-white/[0.03] backdrop-blur-md shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide select-none">
          {letters.map((char, index) => {
            const visible = index < visibleCount;
            return (
              <motion.span
                key={`${char}-${index}`}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={
                  visible
                    ? { opacity: 1, y: 0, filter: "blur(0px)", textShadow: "0 0 16px rgba(34,211,238,0.35)" }
                    : { opacity: 0, y: 6, filter: "blur(3px)", textShadow: "0 0 0 rgba(34,211,238,0)" }
                }
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="inline-block gradient-text"
              >
                {char}
              </motion.span>
            );
          })}
          <motion.span
            className="inline-block w-[2px] h-8 sm:h-9 bg-cyan-400 ml-1 align-middle"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </h2>

        <motion.p
          className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium"
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        >
          {statusText}
          <span className="inline-block w-6 text-left">{".".repeat(dotCount)}</span>
        </motion.p>
      </div>
    </motion.div>
  );
}
