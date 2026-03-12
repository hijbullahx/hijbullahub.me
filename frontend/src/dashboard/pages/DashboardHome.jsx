import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
  const [visits, setVisits] = useState(null);
  const [visitsError, setVisitsError] = useState(false);
  const [visitsLoading, setVisitsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    api.get("/analytics/summary/")
      .then(({ data }) => { setVisits(data); setVisitsLoading(false); })
      .catch((err) => { console.error("Analytics fetch failed:", err?.response?.status, err?.message); setVisitsError(true); setVisitsLoading(false); });
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
    { title: "Manage Education", icon: "🎓", link: "/dashboard/education" },
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

      {/* Visitor Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-white">Visitor Statistics</h2>
          <Link
            to="/dashboard/analytics"
            className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 px-3 py-1.5 rounded-full transition-all"
          >
            Full Analytics →
          </Link>
        </div>

        {visitsLoading && (
          <div className="flex items-center justify-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {visitsError && !visitsLoading && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-500">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">Could not load analytics. Check console for details.</p>
          </div>
        )}

        {visits && !visitsLoading && (
          <>
            {/* Mini stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Visits",  value: visits.total,        icon: "👁️",  grad: "from-cyan-500 to-blue-500" },
                { label: "Today",         value: visits.today,        icon: "📅",  grad: "from-emerald-500 to-teal-500" },
                { label: "Last 7 Days",   value: visits.last_7_days,  icon: "📆",  grad: "from-purple-500 to-pink-500" },
                { label: "Last 30 Days",  value: visits.last_30_days, icon: "🗓️", grad: "from-amber-500 to-orange-500" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">{s.label}</span>
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${s.grad}`}>
                    {s.value.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* 7-day bar chart */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-4">Last 7 Days — Daily Visits</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={visits.daily_30.slice(-7)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0B0F19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#06b6d4" }}
                  />
                  <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                    {visits.daily_30.slice(-7).map((_, i, arr) => (
                      <Cell key={i} fill={i === arr.length - 1 ? "#06b6d4" : "rgba(6,182,212,0.4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
