import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchList } from "../api/client";

const socialContacts = [
  {
    title: "Gmail",
    link: "mailto:hijbullah119445@gmail.com",
    color: "from-red-500 to-red-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 256 193" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z"/>
        <path fill="#34A853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z"/>
        <path fill="#EA4335" d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504z"/>
        <path fill="#FBBC04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z"/>
        <path fill="#C5221F" d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z"/>
      </svg>
    ),
  },
  {
    title: "GitHub",
    link: "https://github.com/hijbullahx",
    color: "from-gray-700 to-gray-900",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "LinkedIn",
    link: "https://linkedin.com/in/hijbullah",
    color: "from-blue-600 to-blue-700",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const RATE_TYPES = [
  { value: "hourly", label: "Per Hour" },
  { value: "daily", label: "Per Day" },
  { value: "task", label: "Per Task / Fixed" },
  { value: "monthly", label: "Per Month" },
];

export default function HireDrawer({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    work_details: "",
    proposed_rate: "",
    rate_type: "hourly",
    duration: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.work_details || !form.proposed_rate || !form.duration) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/hire-requests/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, proposed_rate: parseFloat(form.proposed_rate) }),
        }
      );
      if (response.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", work_details: "", proposed_rate: "", rate_type: "hourly", duration: "", message: "" });
      } else {
        const data = await response.json();
        setError(data?.detail || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0B0F19]/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Secure My Expertise Today</h2>
                <p className="text-gray-400 text-sm mt-0.5">Let's build something great together</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Social Contact Icons */}
            <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Reach me directly</p>
              <div className="flex gap-3">
                {socialContacts.map((s) => (
                  <a
                    key={s.title}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.title}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all"
                  >
                    <span className="flex-shrink-0">{s.icon}</span>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-cyan-400 transition-colors">
                      {s.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Sent!</h3>
                  <p className="text-gray-400 mb-6">I'll get back to you as soon as possible.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all text-sm"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Name <span className="text-cyan-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Email <span className="text-cyan-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Work Details */}
                  <div>
                    <label className={labelClass}>
                      Work / Project Details <span className="text-cyan-500">*</span>
                    </label>
                    <textarea
                      name="work_details"
                      value={form.work_details}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the work, requirements, deliverables…"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Rate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Proposed Rate ($) <span className="text-cyan-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="proposed_rate"
                        value={form.proposed_rate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="e.g. 25"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Rate Type</label>
                      <select
                        name="rate_type"
                        value={form.rate_type}
                        onChange={handleChange}
                        className={inputClass + " cursor-pointer"}
                      >
                        {RATE_TYPES.map((r) => (
                          <option key={r.value} value={r.value} className="bg-[#0B0F19]">
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className={labelClass}>
                      Duration / Timeline <span className="text-cyan-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g. 2 weeks, 1 month, ongoing"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelClass}>
                      Additional Message{" "}
                      <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any extra context, availability, or special requirements…"
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-dark-base bg-gradient-to-r from-primary-cyan to-primary-emerald hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-base/30 border-t-dark-base rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Hire Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
