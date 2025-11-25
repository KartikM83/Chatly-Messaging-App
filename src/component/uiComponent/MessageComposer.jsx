import React, { useState } from "react";
import { GoPaperclip } from "react-icons/go";
import { FiSend } from "react-icons/fi";
import { MdMicNone } from "react-icons/md";
import { LuSmile } from "react-icons/lu";
import IconButton from "./IconButton";
import { MdOutlinePhotoCamera } from "react-icons/md";

export default function MessageComposer({
  onSend,
  showAttach = true,
  showEmoji = true,
  showMic = true,
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="p-2 bg-card border-t">
      <div className="flex items-center gap-2">
        {/* Attach icon */}

        {/* ✍️ Text Input Area */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            rows={5}
            className={cn(
              "w-full px-4 py-3 pr-12 pl-10 border border-primary/50 bg-muted/50 rounded-2xl resize-none text-sm max-h-32 overflow-y-auto",
              "focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 focus:shadow-none transition-smooth"
            )}
            style={{
              minHeight: "48px",
              height: message.split("\n").length > 1 ? "auto" : "48px",
              outline: "none", // ✅ Remove any default outline
              boxShadow: "none", // ✅ Remove browser focus shadow
            }}
            aria-label="Message input"
          />

          {showEmoji && (
            <IconButton
              icon={LuSmile}
              variant="normal"
              ariaLabel="Attach file"
              className="absolute left-0 top-6 -translate-y-1/2  "
            />
          )}

          <div className="absolute right-0 top-6 -translate-y-1/2 flex  ">
            {showAttach && (
              <IconButton
                icon={GoPaperclip}
                variant="normal"
                ariaLabel="Attach file"
              />
            )}

            {showEmoji && (
              <IconButton
                icon={MdOutlinePhotoCamera}
                variant="normal"
                ariaLabel="Attach file"
              />
            )}
          </div>
        </div>

        {/* 🎤 / 📤 Action Button */}
        {message.trim() ? (
          <IconButton
            icon={FiSend}
            variant="primary"
            onClick={handleSend}
            ariaLabel="Send message"
            className="mb-2"
          />
        ) : (
          showMic && (
            <IconButton
              icon={MdMicNone}
              variant="primary"
              ariaLabel="Voice message"
              className="mb-2"
            />
          )
        )}
      </div>
    </div>
  );
}
