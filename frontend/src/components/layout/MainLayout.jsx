import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-200">

      {/* SIDEBAR FOR DESKTOP */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR (SLIDE IN) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-h-screen">

        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
