import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Legend,
} from "recharts";
import api from "../../api/client";
import { useToast } from "../components/ToastContext";

// ── Colour palette matching the system design ────────────────────────────────
const COLORS = ["#06b6d4", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#84cc16"];

// ── Custom Recharts tooltip ───────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B0F19]/95 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Axis tick styles shared ───────────────────────────────────────────────────
const tickStyle = { fill: "#6b7280", fontSize: 11 };

export default function AnalyticsAdmin() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState(7); // 7 or 30 days for daily chart
  const { showToast }         = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get("/analytics/summary/");
      setData(d);
    } catch {
      showToast("Failed to load analytics.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Slice daily data according to selected range
  const dailySlice = data
    ? (range === 7 ? data.daily_30.slice(-7) : data.daily_30)
    : [];

  const peakDay = dailySlice.reduce(
    (max, d) => (d.visits > max.visits ? d : max),
    { visits: 0, date: "—" }
  );

  const avgDaily = dailySlice.length
    ? Math.round(dailySlice.reduce((s, d) => s + d.visits, 0) / dailySlice.length)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Visitor Analytics</h1>
          <p className="text-gray-400 mt-1">Real-time tracking of portfolio visits and engagement.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500/40 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👁️"  label="Total Visits"    value={data.total.toLocaleString()}   gradient="from-cyan-500 to-blue-500"   sub="All time"           delay={0}    />
        <StatCard icon="📅"  label="Today"           value={data.today.toLocaleString()}   gradient="from-emerald-500 to-teal-500" sub="Since midnight"      delay={0.05} />
        <StatCard icon="📆"  label="Last 7 Days"     value={data.last_7_days.toLocaleString()} gradient="from-purple-500 to-pink-500"   sub={`avg ${Math.round(data.last_7_days / 7)}/day`} delay={0.1}  />
        <StatCard icon="🗓️" label="Last 30 Days"    value={data.last_30_days.toLocaleString()} gradient="from-amber-500 to-orange-500"  sub={`peak: ${peakDay.visits} on ${peakDay.date}`} delay={0.15} />
      </div>

      {/* Daily visits chart */}
      <ChartCard
        title="Daily Visits"
        subtitle={`Showing last ${range} days — ${avgDaily} avg/day`}
      >
        {/* Range toggle */}
        <div className="flex gap-2 mb-4">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                range === r
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailySlice} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
              tick={tickStyle}
            />
            <YAxis tick={tickStyle} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} />
            <Area
              type="monotone"
              dataKey="visits"
              name="visits"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#visitGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#06b6d4" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Hourly + Top pages row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hourly today */}
        <ChartCard title="Today — Visits by Hour" subtitle="Activity distribution for the current day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.hourly_today} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => h.slice(0, 2)}
                tick={tickStyle}
                interval={3}
              />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="visits" name="visits" radius={[3, 3, 0, 0]}>
                {data.hourly_today.map((_, i) => (
                  <Cell key={i} fill={i === new Date().getHours() ? "#06b6d4" : "rgba(6,182,212,0.35)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top pages pie */}
        <ChartCard title="Top Pages" subtitle="Most visited sections of the portfolio">
          {data.top_pages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No page data yet.</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={data.top_pages}
                    dataKey="count"
                    nameKey="page"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {data.top_pages.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {data.top_pages.map((p, i) => (
                  <div key={p.page} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-gray-300 truncate capitalize flex-1">{p.page}</span>
                    <span className="text-gray-500 tabular-nums">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* 30-day bar comparison */}
      <ChartCard title="30-Day Visit Bars" subtitle="Day-by-day volume overview">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.daily_30} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
              tick={tickStyle}
              interval={4}
            />
            <YAxis tick={tickStyle} allowDecimals={false} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="visits" name="visits" radius={[3, 3, 0, 0]}>
              {data.daily_30.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.visits === peakDay.visits ? "#10b981" : "rgba(16,185,129,0.4)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-right">
          Peak day highlighted in green · {peakDay.date} ({peakDay.visits} visits)
        </p>
      </ChartCard>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-600 pb-4">
        Analytics track page views recorded when visitors load portfolio pages. Data is stored privately on your server.
      </p>
    </div>
  );
}
