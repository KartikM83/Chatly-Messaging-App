import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { IoCallOutline, IoSettingsOutline } from "react-icons/io5";
import { LuCircleDashed, LuMessageSquareText, LuArchive } from "react-icons/lu";
import { RiRobot3Line } from "react-icons/ri";
import { IoMdMenu } from "react-icons/io";

export default function DesktopNav({ onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navItems = [
    { icon: LuMessageSquareText, label: "Chats", path: "/chats" },
    { icon: IoCallOutline, label: "Calls", path: "/calls" },
    { icon: LuCircleDashed, label: "Status", path: "/status" },
    { icon: RiRobot3Line, label: "Chatly Ai", path: "/chats/chatly-ai" },
    { icon: LuArchive, label: "Archived", path: "/archived" },
  ];

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  const toggleSidebar = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onToggle?.(next);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex fixed top-14 left-0 z-40 flex-col justify-between border-border bg-card transition-all duration-300 shadow-sm",
        isExpanded ? "w-60 shadow-xl" : "w-14 border-r"
      )}
      style={{ height: "calc(100% - 56px)" }}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <nav className="flex flex-col space-y-1">
          <div className="flex items-center h-[56px] px-4 border-b">
            <button
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <IoMdMenu className="w-6 h-6" />
            </button>
          </div>

          {navItems.map((item) => {
            // ✅ Custom active logic for /chats
            const isChatlyAI = location.pathname.startsWith("/chats/chatly-ai");
            const isChats =
              item.path === "/chats" &&
              location.pathname.startsWith("/chats") &&
              !isChatlyAI;

            const active =
              item.path === "/chats"
                ? isChats
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isExpanded ? toggleSidebar : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          <IoSettingsOutline className="w-6 h-6 flex-shrink-0" />
          {isExpanded && <span className="text-sm truncate">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
