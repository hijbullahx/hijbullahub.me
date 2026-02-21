import { motion } from "framer-motion";

export default function GradientBadge({ children, className = "" }) {
  return (
    <motion.span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-cyan/20 to-primary-emerald/20 border border-primary-cyan/30 text-primary-cyan ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
}
