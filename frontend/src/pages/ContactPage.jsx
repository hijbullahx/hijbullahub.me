import { useState } from "react";
import { motion } from "framer-motion";

import api from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import GlassCard from "../components/GlassCard";
import SectionTitle from "../components/SectionTitle";
import GlowButton from "../components/GlowButton";

const initial = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ loading: false, message: "" });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: "" });
    try {
      await api.post("/contact/", form);
      setForm(initial);
      setStatus({ loading: false, message: "Message sent successfully." });
    } catch {
      setStatus({ loading: false, message: "Failed to send message." });
    }
  };

  const socialContacts = [
    {
      title: "Email",
      value: "contact@yourportfolio.com",
      link: "mailto:contact@yourportfolio.com",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "GitHub",
      value: "@hijbullah",
      link: "https://github.com/hijbullah",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "LinkedIn",
      value: "hijbullah",
      link: "https://linkedin.com/in/hijbullah",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <AnimatedSection>
        <SectionTitle
          title="Get In Touch"
          subtitle="Have a project in mind or just want to say hi? Drop me a message!"
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
          {/* Contact Info Cards */}
          {socialContacts.map((contact, idx) => (
            <motion.a
              key={idx}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="block"
            >
              <GlassCard className="h-full p-6 text-center transition-all hover:border-primary-cyan/50">
                <div className="mb-4 flex justify-center text-primary-cyan">
                  {contact.icon}
                </div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {contact.title}
                </h3>
                <p className="text-lg font-semibold text-white break-words">
                  {contact.value}
                </p>
              </GlassCard>
            </motion.a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="mx-auto mt-12 max-w-2xl">
          <GlassCard className="p-8">
            <form className="space-y-6" onSubmit={submit}>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-slate-700 bg-dark-elevated px-4 py-3 text-white transition-all focus:border-primary-cyan/50 focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-700 bg-dark-elevated px-4 py-3 text-white transition-all focus:border-primary-cyan/50 focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-300">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="What's this about?"
                  className="w-full rounded-xl border border-slate-700 bg-dark-elevated px-4 py-3 text-white transition-all focus:border-primary-cyan/50 focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell me more about your project..."
                  rows={6}
                  className="w-full rounded-xl border border-slate-700 bg-dark-elevated px-4 py-3 text-white transition-all focus:border-primary-cyan/50 focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                  required
                />
              </div>

              <GlowButton type="submit" disabled={status.loading} className="w-full">
                {status.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </GlowButton>

              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-4 text-center ${
                    status.message.includes("success")
                      ? "bg-primary-emerald/10 text-primary-emerald"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {status.message}
                </motion.div>
              )}
            </form>
          </GlassCard>
        </div>
      </AnimatedSection>
    </div>
  );
}
