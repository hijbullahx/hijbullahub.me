import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Md. Taher Bin Omar Hijbullah
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AI &amp; Robotics Research • Autonomous Systems
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/projects" className="hover:text-cyan-500 transition-colors">Projects</Link>
            <Link to="/ai-ml" className="hover:text-cyan-500 transition-colors">AI/ML</Link>
            <Link to="/research" className="hover:text-cyan-500 transition-colors">Research</Link>
            <Link to="/contact" className="hover:text-cyan-500 transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-500">
            © {currentYear} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
