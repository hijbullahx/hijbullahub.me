import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const menuSections = [
  {
    title: "Content Management",
    icon: "📝",
    items: [
      { path: "/dashboard/hero", label: "Hero", icon: "🌟" },
      { path: "/dashboard/about", label: "About", icon: "👤" },
      { path: "/dashboard/skills", label: "Skills", icon: "⚡" },
      { path: "/dashboard/experience", label: "Experience", icon: "💼" },
      { path: "/dashboard/achievements", label: "Achievements", icon: "🏆" },
    ],
  },
  {
    title: "Portfolio",
    icon: "💼",
    items: [
      { path: "/dashboard/projects", label: "Projects", icon: "🚀" },
      { path: "/dashboard/research", label: "Research", icon: "🔬" },
      { path: "/dashboard/ai-lab", label: "AI Lab", icon: "🤖" },
    ],
  },
  {
    title: "Publishing",
    icon: "📰",
    items: [
      { path: "/dashboard/blog", label: "Blog", icon: "✍️" },
    ],
  },
  {
    title: "Communication",
    icon: "💬",
    items: [
      { path: "/dashboard/contact", label: "Contact Messages", icon: "📧" },
      { path: "/dashboard/contributions", label: "Research Contributions", icon: "🤝" },
      { path: "/dashboard/acquisitions", label: "Project Acquisitions", icon: "🏢" },
    ],
  },
  {
    title: "Settings",
    icon: "⚙️",
    items: [
      { path: "/dashboard/settings", label: "Site Settings", icon: "🔧" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-screen w-72 bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/10 z-50 lg:translate-x-0 lg:static overflow-y-auto custom-scrollbar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HijbullahHub</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {menuSections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </div>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    
                    {/* Active indicator */}
                    <div className="ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-[.active]:opacity-100 transition-opacity" />
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0B0F19]/95">
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Live Site
          </a>
        </div>
      </motion.aside>
    </>
  );
}
