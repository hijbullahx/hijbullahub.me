import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = true, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      className={`glass relative p-6 ${hover ? "card-hover" : ""} ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="glass-border" />
      {children}
    </motion.div>
  );
}
