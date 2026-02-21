import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Dashboard Footer */}
        <footer className="py-4 px-6 border-t border-white/10 bg-dark-base/50">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-cyan-400">Md. Taher Bin Omar Hijbullah</span>. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
