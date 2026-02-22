import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    projects: 0,
    feedbacks: 0,
    research: 0,
    contributions: 0,
    acquisitions: 0,
    hireRequests: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projects, research, contributions, acquisitions, hireReqs, feedbackRes] = await Promise.all([
        api.get("/projects/"),
        api.get("/research/"),
        api.get("/research-contributions/"),
        api.get("/project-acquisitions/"),
        api.get("/hire-requests/"),
        api.get("/feedback/"),
      ]);

      setStats({
        projects: (projects.data.results || projects.data).length,
        feedbacks: (feedbackRes.data.results || feedbackRes.data).length,
        research: (research.data.results || research.data).length,
        contributions: (contributions.data.results || contributions.data).filter((c) => c.status === "pending").length,
        acquisitions: (acquisitions.data.results || acquisitions.data).filter((a) => a.status === "pending").length,
        hireRequests: (hireReqs.data.results || hireReqs.data).filter((h) => h.status === "new").length,
      });
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      icon: "🚀",
      color: "from-cyan-500 to-blue-500",
      link: "/dashboard/projects",
    },
    {
      title: "Feedback",
      value: stats.feedbacks,
      icon: "⭐",
      color: "from-amber-500 to-orange-500",
      link: "/dashboard/feedback",
    },
    {
      title: "Research Papers",
      value: stats.research,
      icon: "🔬",
      color: "from-amber-500 to-orange-500",
      link: "/dashboard/research",
    },
    {
      title: "Pending Contributions",
      value: stats.contributions,
      icon: "🤝",
      color: "from-rose-500 to-pink-500",
      link: "/dashboard/contributions",
    },
    {
      title: "Pending Acquisitions",
      value: stats.acquisitions,
      icon: "🏢",
      color: "from-indigo-500 to-purple-500",
      link: "/dashboard/acquisitions",
    },
    {
      title: "New Hire Requests",
      value: stats.hireRequests,
      icon: "💼",
      color: "from-cyan-500 to-emerald-500",
      link: "/dashboard/hire-requests",
    },
  ];

  const quickLinks = [
    { title: "Edit Hero Section", icon: "🌟", link: "/dashboard/hero" },
    { title: "Edit Mission & Vision", icon: "🎯", link: "/dashboard/about" },
    { title: "Manage Skills", icon: "⚡", link: "/dashboard/skills" },
    { title: "Update Experience", icon: "💼", link: "/dashboard/experience" },
    { title: "Add Achievement", icon: "🏆", link: "/dashboard/achievements" },
    { title: "AI/ML Lab Projects", icon: "🤖", link: "/dashboard/ai-lab" },
    { title: "Edit Contact Info", icon: "📡", link: "/dashboard/contact-profiles" },
    { title: "Manage Feedback", icon: "⭐", link: "/dashboard/feedback" },
    { title: "Site Settings", icon: "⚙️", link: "/dashboard/settings" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Here's what's happening with HijbullahHub today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-xl blur-xl"
                style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group-hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{link.icon}</div>
                  <div>
                    <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {link.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="text-center text-gray-400 py-8">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Activity tracking coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
