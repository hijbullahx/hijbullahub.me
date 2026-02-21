import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mt-auto py-6 border-t border-white/10 bg-dark-base/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-slate-400">
            © {currentYear}{" "}
            <span className="font-semibold gradient-text">Md. Taher Bin Omar Hijbullah</span>. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
