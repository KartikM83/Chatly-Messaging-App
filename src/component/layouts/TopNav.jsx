import { FiSearch } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function TopNav({ isSidebarExpanded }) {
  return (
    <header
      className={`w-full fixed top-0 right-0 h-[56px] border-b border-border bg-primary flex items-center justify-between px-4 transition-all duration-300 ${
        isSidebarExpanded ? "md:ml-60" : "md:ml-16"
      }`}
    >
      <div className="absolute z-9999 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-white">Chatly</h1>
      </div>
    </header>
  );
}
