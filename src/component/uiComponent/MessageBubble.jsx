import React from "react";
import { BiCheckDouble, BiCheck } from "react-icons/bi";
import { useOnlineStatus } from "../../utils/App";

export default function MessageBubble({ message, isOwn }) {
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const isOnline = useOnlineStatus();

  const timeString = message?.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={cn(
        "flex mb-2 sm:mb-3 px-2 sm:px-3 animate-fade-in",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          // make it a normal flex box with a hard max-width
          "flex flex-col w-fit",
          "max-w-[90%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]",
          "rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-soft",
          isOwn
            ? "bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-fg))] rounded-br-md"
            : "bg-[hsl(var(--chat-bubble-received))] text-[hsl(var(--chat-bubble-received-fg))] rounded-bl-md"
        )}
      >
        {/* Message Text */}
        {message.content && (
          <p
            className="
              text-[13px] sm:text-sm leading-relaxed
              break-all  /* 🔥 force super-long words to wrap */
            "
          >
            {message.content}
          </p>
        )}

        {/* Time + Status */}
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[11px] sm:text-xs",
            isOwn ? "justify-end opacity-90" : "justify-start opacity-70"
          )}
        >
          <span className="whitespace-nowrap">{timeString}</span>

          {/* Status Icons (only for own messages) */}
          {isOwn && (
            <span className="ml-0.5 flex items-center">
              {!isOnline ? (
                // OFFLINE → force single tick
                <BiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : message.status === "SEEN" ? (
                <BiCheckDouble className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              ) : message.status === "DELIVERED" ? (
                <BiCheckDouble className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <BiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
