import { useState } from "react";
import TopNav from "./TopNav";
import DesktopNav from "../navigation/DesktopNav";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <DesktopNav onToggle={setIsSidebarExpanded} />

      {/* Main Section */}
      <div className="flex flex-1 flex-col transition-all duration-300">
        {/* ✅ Top Navigation (Desktop Only) */}
        <div className="hidden md:block">
          <TopNav isSidebarExpanded={isSidebarExpanded} />
        </div>

        {/* ✅ Page Content */}
        <main
          className={`flex-1 overflow-hidden md:ml-[56px] ${"md:pt-[56px] pt-0"}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
