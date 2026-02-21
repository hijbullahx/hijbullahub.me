import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const links = [
  ["/", "Home"],
  ["/projects", "Projects"],
  ["/blog", "Blog"],
  ["/research", "Research"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-dark-base/80"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.h1
          whileHover={{ scale: 1.05 }}
          className="text-xl font-bold gradient-text tracking-wide"
        >
          HijbullahHub
        </motion.h1>
        <div className="flex gap-6 text-sm font-medium">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? "text-primary-cyan text-glow"
                  : "text-slate-300 hover:text-primary-cyan transition-colors duration-300"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}
