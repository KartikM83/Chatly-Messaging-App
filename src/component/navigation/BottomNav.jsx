import { IoCallOutline } from "react-icons/io5";
import { LuCircleDashed, LuArchive, LuMessageSquareText } from "react-icons/lu";
import { RiRobot3Line } from "react-icons/ri";
import { FaRegStar } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { icon: LuMessageSquareText, label: "Chats", path: "/chats" },
    { icon: IoCallOutline, label: "Calls", path: "/calls" },
    { icon: LuCircleDashed, label: "Status", path: "/status" },
    { icon: RiRobot3Line, label: "Chatly Ai", path: "/chatly-ai" },
    { icon: LuArchive, label: "Archived", path: "/archived" },
  ];

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-smooth min-w-[60px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[13px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
