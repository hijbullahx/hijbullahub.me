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

  useEffect(() => {
    fetchList("/contact-profiles/")
      .then((data) => setContacts(data.filter((c) => c.is_active)))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <AnimatedSection>
        <SectionTitle
          title="Connect With Me"
          subtitle="Let's collaborate and build something amazing together!"
        />

        <div className="mx-auto mt-16 flex flex-wrap justify-center gap-10 max-w-5xl">
          {contacts.map((contact, idx) => {
            const [clrA, clrB] = getPlatformColors(contact.icon_type);

            return (
              <motion.a
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], transition: { duration: 0.3 } }}
                className="block group w-64 flex-shrink-0"
              >
                <div className="relative w-64 h-64">
                  {/* Thin ring — invisible at rest, fades in + spins on hover */}
                  <div className="absolute -inset-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 overflow-hidden">
                    <motion.div
                      className="w-full h-full rounded-full"
                      style={{ background: `conic-gradient(from 0deg, ${clrA}, ${clrB}, transparent 60%, ${clrA})` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  {/* Main circular card — dark, merges with background */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border border-white/[0.06] backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-300"
                    style={{ background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.04), rgba(5,7,15,0.85))" }}
                  >

                    {/* Profile image watermark */}
                    {contact.profile_image_url && (
                      <img
                        src={contact.profile_image_url}
                        alt={`${contact.title} profile`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                        style={{
                          opacity: contact.image_opacity ?? 0.2,
                          filter: "grayscale(20%) brightness(0.8)",
                        }}
                        crossOrigin="anonymous"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                        <ContactIcon iconType={contact.icon_type} size="h-20 w-20" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan to-primary-emerald mb-2">
                        {contact.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {contacts.length === 0 && (
          <p className="text-center text-gray-400 mt-16">No contact profiles found.</p>
        )}
      </AnimatedSection>
    </div>
  );
}
