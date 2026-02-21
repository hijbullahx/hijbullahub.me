import { motion } from "framer-motion";

export default function GlowButton({ children, onClick, href, className = "", variant = "primary" }) {
  const baseClasses = "glow-button text-dark-base font-bold";
  
  const Component = href ? motion.a : motion.button;
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </Component>
  );
}
