import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ProtectedRoute from "./components/ProtectedRoute";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import AIMLPage from "./pages/AIMLPage";
import ResearchPage from "./pages/ResearchPage";

// Dashboard imports
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./dashboard/components/ToastContext";
import DashboardLayout from "./dashboard/DashboardLayout";
import LoginPage from "./dashboard/LoginPage";
import DashboardHome from "./dashboard/pages/DashboardHome";
import ProjectsAdmin from "./dashboard/pages/ProjectsAdmin";
import ContactAdmin from "./dashboard/pages/ContactAdmin";
import HeroAdmin from "./dashboard/pages/HeroAdmin";
import AboutAdmin from "./dashboard/pages/AboutAdmin";
import SkillsAdmin from "./dashboard/pages/SkillsAdmin";
import ExperienceAdmin from "./dashboard/pages/ExperienceAdmin";
import AchievementsAdmin from "./dashboard/pages/AchievementsAdmin";
import ResearchAdmin from "./dashboard/pages/ResearchAdmin";
import ContributionRequestsAdmin from "./dashboard/pages/ContributionRequestsAdmin";
import AcquisitionRequestsAdmin from "./dashboard/pages/AcquisitionRequestsAdmin";
import HireRequestsAdmin from "./dashboard/pages/HireRequestsAdmin";
import ContactProfileAdmin from "./dashboard/pages/ContactProfileAdmin";
import AILabAdmin from "./dashboard/pages/AILabAdmin";
import SettingsAdmin from "./dashboard/pages/SettingsAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CustomCursor />
            <div className="min-h-screen">
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
                <Route path="experience" element={<ExperienceAdmin />} />
                <Route path="achievements" element={<AchievementsAdmin />} />
                <Route path="research" element={<ResearchAdmin />} />
                <Route path="contributions" element={<ContributionRequestsAdmin />} />
                <Route path="acquisitions" element={<AcquisitionRequestsAdmin />} />
                <Route path="hire-requests" element={<HireRequestsAdmin />} />
                <Route path="contact-profiles" element={<ContactProfileAdmin />} />
                <Route path="ai-lab" element={<AILabAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
              </Route>
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
