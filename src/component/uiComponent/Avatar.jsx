import React from "react";

// Simple helper to combine classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Avatar({
  src,
  alt,
  size = "md",
  status,
  className = "",
  showActions,
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden ring-2 ring-white  ",
          sizeClasses[size]
        )}
      >
        {typeof src === "string" ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl">
            {src}
          </div>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
            statusColors[status]
          )}
        />
      )}

      {showActions && (
        <span
          className={cn(
            "md:hidden absolute top-8 left-8 w-3 h-3 rounded-full border-2 text-white border-white p-[8px] bg-primary flex items-center justify-center text-xs"
          )}
        >
          ✓
        </span>
      )}
    </div>
  );
}
