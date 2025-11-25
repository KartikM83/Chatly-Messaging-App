import React from "react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { PiChecksBold } from "react-icons/pi";
import { BiCheckDouble } from "react-icons/bi";
import { BiCheck } from "react-icons/bi";

export default function MessageBubble({ message, isOwn }) {
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div
      className={`flex mb-3 animate-fade-in  ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={cn(
          "max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-soft ",
          isOwn
            ? "bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-fg))] rounded-br-md"
            : "bg-[hsl(var(--chat-bubble-received))] text-[hsl(var(--chat-bubble-received-fg))] rounded-bl-md"
        )}
      >
        {/* Message Text */}
        {message.content && (
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        )}

        {/* Time + Status */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            isOwn ? "justify-end opacity-90" : "opacity-70"
          }`}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Status Icons */}
          {isOwn && (
            <span className="ml-1">
              {message.status === "read" ? (
                <BiCheckDouble className="w-5 h-5 text-blue-500" />
              ) : message.status === "delivered" ? (
                <BiCheckDouble className="w-5 h-5 text-white" />
              ) : (
                <BiCheck className="w-5 h-5 text-white" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
