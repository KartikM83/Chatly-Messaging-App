import React from "react";
import { IoSearch } from "react-icons/io5";

export default function SearchInput({
  value,
  placeholder,
  onChange,
  className = "",
}) {
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className={cn("relative w-full", className)}>
      <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-0 rounded-xl text-sm focus:outline-none focus-within:ring-2 focus-within:ring-primary "
      />
    </div>
  );
}

// // Simple class merging utility (optional helper)
// function cn(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function SearchInput({
//   value,
//   onChange,
//   placeholder = "Search...",
//   className = "",
// }) {
//   return (
//     <div className={cn("relative w-full", className)}>
//       <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         aria-label={placeholder}
//          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
//       />
//     </div>
//   );
// }
