import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = true }) {
  return (
    <motion.div
      className={`glass relative p-6 ${hover ? "card-hover" : ""} ${className}`}
      whileHover={hover ? { scale: 1.02, y: -8 } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-border absolute inset-0 -z-10" />
      {children}
    </motion.div>
  );
}
