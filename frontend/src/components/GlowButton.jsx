import { motion } from "framer-motion";

export default function GlowButton({ children, onClick, href, className = "", variant = "primary", type = "button", ...props }) {
  const baseClasses = "glow-button text-dark-base font-bold flex items-center justify-center";
  
  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseClasses} ${className}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
