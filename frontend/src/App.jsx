import { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import MuteButton from "./components/MuteButton";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingState from "./components/LoadingState";

// Dashboard imports
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoundProvider } from "./contexts/SoundContext";
import { ToastProvider } from "./dashboard/components/ToastContext";
import api from "./api/client";

const ContactPage = lazy(() => import("./pages/ContactPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AIMLPage = lazy(() => import("./pages/AIMLPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));

const DashboardLayout = lazy(() => import("./dashboard/DashboardLayout"));
const LoginPage = lazy(() => import("./dashboard/LoginPage"));
const DashboardHome = lazy(() => import("./dashboard/pages/DashboardHome"));
const ProjectsAdmin = lazy(() => import("./dashboard/pages/ProjectsAdmin"));
const ContactAdmin = lazy(() => import("./dashboard/pages/ContactAdmin"));
const HeroAdmin = lazy(() => import("./dashboard/pages/HeroAdmin"));
const AboutAdmin = lazy(() => import("./dashboard/pages/AboutAdmin"));
const SkillsAdmin = lazy(() => import("./dashboard/pages/SkillsAdmin"));
const ExperienceAdmin = lazy(() => import("./dashboard/pages/ExperienceAdmin"));
const EducationAdmin = lazy(() => import("./dashboard/pages/EducationAdmin"));
const AchievementsAdmin = lazy(() => import("./dashboard/pages/AchievementsAdmin"));
const ResearchAdmin = lazy(() => import("./dashboard/pages/ResearchAdmin"));
const ContributionRequestsAdmin = lazy(() => import("./dashboard/pages/ContributionRequestsAdmin"));
const AcquisitionRequestsAdmin = lazy(() => import("./dashboard/pages/AcquisitionRequestsAdmin"));
const HireRequestsAdmin = lazy(() => import("./dashboard/pages/HireRequestsAdmin"));
const ContactProfileAdmin = lazy(() => import("./dashboard/pages/ContactProfileAdmin"));
const FeedbackAdmin = lazy(() => import("./dashboard/pages/FeedbackAdmin"));
const AILabAdmin = lazy(() => import("./dashboard/pages/AILabAdmin"));
const SettingsAdmin = lazy(() => import("./dashboard/pages/SettingsAdmin"));
const AnalyticsAdmin = lazy(() => import("./dashboard/pages/AnalyticsAdmin"));

// Fires a silent POST to record each public page view
function VisitTracker() {
  const location = useLocation();
  const lastPath = useRef(null);
  const VISIT_THROTTLE_MS = 10 * 60 * 1000;
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) return;
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    const page = location.pathname === "/" ? "home" : location.pathname.slice(1);
    const key = `visit:${page}`;
    const lastSent = Number(sessionStorage.getItem(key) || "0");
    if (Date.now() - lastSent < VISIT_THROTTLE_MS) return;
    sessionStorage.setItem(key, String(Date.now()));
    api.post("/analytics/visit/", { page, referrer: document.referrer }).catch(() => {});
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SoundProvider>
              <CustomCursor />
              <MuteButton />
              <VisitTracker />
              <div className="min-h-screen">
            <Suspense fallback={<LoadingState />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="mx-auto max-w-6xl px-4 py-8">
                    <HomePage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/projects" element={
                <>
                  <Navbar />
                  <main className="mx-auto max-w-6xl px-4 py-8">
                    <ProjectsPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/ai-ml" element={
                <>
                  <Navbar />
                  <main className="mx-auto max-w-6xl px-4 py-8">
                    <AIMLPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/research" element={
                <>
                  <Navbar />
                  <main className="mx-auto max-w-6xl px-4 py-8">
                    <ResearchPage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <main className="mx-auto max-w-6xl px-4 py-8">
                    <ContactPage />
                  </main>
                  <Footer />
                </>
              } />

              {/* Dashboard Login */}
              <Route path="/dashboard/login" element={<LoginPage />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="projects" element={<ProjectsAdmin />} />
                <Route path="contact" element={<ContactAdmin />} />
                <Route path="hero" element={<HeroAdmin />} />
                <Route path="about" element={<AboutAdmin />} />
                <Route path="skills" element={<SkillsAdmin />} />
                <Route path="education" element={<EducationAdmin />} />
                <Route path="experience" element={<ExperienceAdmin />} />
                <Route path="achievements" element={<AchievementsAdmin />} />
                <Route path="research" element={<ResearchAdmin />} />
                <Route path="contributions" element={<ContributionRequestsAdmin />} />
                <Route path="acquisitions" element={<AcquisitionRequestsAdmin />} />
                <Route path="hire-requests" element={<HireRequestsAdmin />} />
                <Route path="contact-profiles" element={<ContactProfileAdmin />} />
                <Route path="feedback" element={<FeedbackAdmin />} />
                <Route path="ai-lab" element={<AILabAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
                <Route path="analytics" element={<AnalyticsAdmin />} />
              </Route>
            </Routes>
            </Suspense>
          </div>
            </SoundProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
