import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { fetchList } from "../api/client";
import AnimatedSection from "../components/AnimatedSection";
import SectionTitle from "../components/SectionTitle";
import { ContactIcon, getPlatformColors } from "../components/ContactIcons";
import LoadingState from "../components/LoadingState";

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchList("/contact-profiles/")
      .then((data) => setContacts(data.filter((c) => c.is_active)))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="container mx-auto px-4 py-24 min-h-[90vh] flex flex-col justify-center">
      <AnimatedSection>
        <SectionTitle
          title="Connect &amp; Collaborate"
          subtitle="Whether for research partnerships, autonomous robotics initiatives, or enterprise AI consulting, I'd love to connect."
        />

        {/* Quick Contact Bar */}
        <div className="max-w-2xl mx-auto mb-14 p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
                ✉️
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct Email</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  hijbullah119445@gmail.com
                </p>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard("hijbullah119445@gmail.com", "email")}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"
            >
              {copiedKey === "email" ? "✓ Copied!" : "Copy Address"}
            </button>
          </div>
        </div>

        {/* Dynamic Social Profiles */}
        <div className="mx-auto flex flex-wrap justify-center gap-8 max-w-5xl">
          {contacts.map((contact, idx) => {
            const [clrA, clrB] = getPlatformColors(contact.icon_type);

            return (
              <motion.a
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.05 }}
                className="group w-48 sm:w-52 flex-shrink-0 focus:outline-none"
              >
                <div className="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto">
                  {/* Rotating Conic Gradient Ring on Hover */}
                  <div className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                    <motion.div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, ${clrA}, ${clrB}, transparent 60%, ${clrA})`,
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  {/* Main Avatar Card */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col items-center justify-center transition-all bg-white dark:bg-slate-900 shadow-md dark:shadow-2xl">
                    {/* Watermark profile image if present */}
                    {contact.profile_image_url && (
                      <img
                        src={contact.profile_image_url}
                        alt={`${contact.title} background`}
                        className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20 grayscale pointer-events-none"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                      <div className="group-hover:scale-110 transition-transform duration-300 mb-2">
                        <ContactIcon iconType={contact.icon_type} size="h-12 w-12" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        {contact.title}
                      </span>
                      {contact.subtitle && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {contact.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </AnimatedSection>
    </div>
  );
}
