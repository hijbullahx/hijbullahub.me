import { motion } from "framer-motion";

import AnimatedSection from "../components/AnimatedSection";
import SectionTitle from "../components/SectionTitle";

export default function ContactPage() {
  const socialContacts = [
    {
      title: "Gmail",
      link: "mailto:hijbullah119445@gmail.com",
      color: "from-red-500 to-red-600",
      profileImage: "https://drive.google.com/file/d/1Y7Rj6m1clQEthMd8YXEQkBGfXYHN4cNO/view?usp=sharing",
      icon: (
        <svg className="h-20 w-20" viewBox="0 0 256 193" xmlns="http://www.w3.org/2000/svg">
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
      profileImage: "https://avatars.githubusercontent.com/u/185400725?v=4",
      icon: (
        <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "LinkedIn",
      link: "https://linkedin.com/in/hijbullah",
      color: "from-blue-600 to-blue-700",
      icon: (
        <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <AnimatedSection>
        <SectionTitle
          title="Connect With Me"
          subtitle="Let's collaborate and build something amazing together!"
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
          {socialContacts.map((contact, idx) => (
            <motion.a
              key={idx}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: idx * 0.2, 
                type: "spring", 
                stiffness: 200, 
                damping: 20 
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
              className="block group"
            >
              <div className="relative">
                {/* Circular glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${contact.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300`} />
                
                {/* Main circular card */}
                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-white/10 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 flex flex-col items-center justify-center transition-all duration-300 group-hover:border-primary-cyan/50 group-hover:shadow-2xl group-hover:shadow-primary-cyan/20">
                  
                  {/* Profile Image Watermark */}
                  {contact.profileImage && (
                    <img
                      src={contact.profileImage}
                      alt={`${contact.title} profile`}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        filter: 'grayscale(20%) brightness(0.8)',
                      }}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none'; // Hide if image fails to load
                      }}
                    />
                  )}
                  
                  {/* Content overlay */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {/* Icon */}
                    <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                      {contact.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan to-primary-emerald mb-2">
                      {contact.title}
                    </h3>
                    
                    {/* Value */}
                    <p className="text-sm font-medium text-slate-300 px-4 text-center break-words group-hover:text-white transition-colors duration-300">
                      {contact.value}
                    </p>
                  </div>
                  
                  {/* Animated ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r ${contact.color} opacity-0 group-hover:opacity-100`}
                    style={{ 
                      background: 'transparent',
                      borderImage: `linear-gradient(to right, var(--tw-gradient-stops)) 1`
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
