    // src/components/uiComponent/MessageBubble.jsx
    import React from "react";
    import { BiCheckDouble, BiCheck } from "react-icons/bi";
    import { useOnlineStatus } from "../../utils/App";
    import { FaFileAlt, FaRegFilePdf } from "react-icons/fa";
    import { FaFilePdf } from "react-icons/fa6";

    export default function MessageBubble({ message, isOwn,onContextMenu  }) {
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

    const type = (message?.type || "TEXT")
      .toString()
      .toUpperCase();   // 👈 make sure it's a string, uppercase
    const content = message?.content || "";

    // ---- helpers ----
    const isImageUrl = (url) => {
      try {
        const clean = url.split("?")[0];
        return /\.(png|jpe?g|gif|webp|svg)$/i.test(clean);
      } catch {
        return false;
      }
    };

    const getFileName = (url) => {
      try {
        const clean = url.split("?")[0];              // remove query params
        const full = decodeURIComponent(clean.split("/").pop() || "");

        // If filename contains PREFIX_UUID_original-name
        // Example → 1765120509672_94a5d8f4_ChatlyAPI.pdf
        const parts = full.split("_");

        // The REAL name is everything after the 2 prefixes
        // (timestamp + uuid)
        if (parts.length >= 3) {
          return parts.slice(2).join("_");           // → "ChatlyAPI.pdf"
        }

        return full;                                  // fallback
      } catch {
        return "file";
      }
    };


    const renderContent = () => {
      if (!content) return null;

      const looksLikeImage =
        isImageUrl(content) ||
        type === "IMAGE" ||      // 👈 in case backend uses IMAGE
        type === "PHOTO" ||
        type === "PROFILE_IMAGE";

      // ✅ 1) If it looks like image → ALWAYS render <img>, no matter type
      if (looksLikeImage) {
        return (
          <div className="max-w-full">
            <img
              src={content}
              alt="attachment"
              className="rounded-lg max-w-full max-h-[260px] object-cover"
            />
          </div>
        );
      }

      // ✅ 2) VIDEO message
      if (type === "VIDEO") {
        return (
          <div className="max-w-full">
            <video
              src={content}
              controls
              className="rounded-lg max-w-full max-h-[260px] bg-black"
            />
          </div>
        );
      }

      // ✅ 3) AUDIO message
      if (type === "AUDIO") {
        return (
          <div className="max-w-full">
            <audio controls src={content} className="w-full" />
          </div>
        );
      }

    // ✅ 4) FILE / DOCUMENT (PDF, docs, etc.)
    if (
      type === "FILE" ||
      type === "DOCUMENT" ||
      /\.(pdf|docx?|xlsx?|pptx?)$/i.test(content)
    ) {
      const fileName = getFileName(content);
      const clean = content.split("?")[0];
      const isPdf = /\.pdf$/i.test(clean);

      // 🔴 WhatsApp-style PDF card
      if (isPdf) {
        return (
          <div className="w-[260px] sm:w-[320px] rounded-xl overflow-hidden bg-background/40">
            {/* Header: icon + name */}
            <div className="flex items-start gap-3 p-3">
              <FaFilePdf className="w-8 h-8 sm:w-9 sm:h-9 text-red-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {fileName}
                </span>
                <span className="text-[11px] sm:text-xs opacity-80">
                  PDF document
                </span>
              </div>
            </div>

            {/* Footer: Open / Save as */}
            <div className="flex border-t border-white/10">
              <a
                href={content}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 text-center text-xs sm:text-sm font-medium hover:bg-background/60 transition"
              >
                Open
              </a>
              <a
                href={content}
                download={fileName}
                className="flex-1 py-2 text-center text-xs sm:text-sm font-medium border-l border-white/10 hover:bg-background/60 transition"
              >
                Save as…
              </a>
            </div>
          </div>
        );
      }

      // 🟡 Other docs (Word, Excel, PPT, etc.)
      return (
        <a
          href={content}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[13px] sm:text-sm max-w-full"
        >
          <FaFileAlt className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="truncate">{fileName}</span>
        </a>
      );
    }


      // ✅ 5) fallback → plain text (for TEXT type etc.)
      return (
        <p className="text-[13px] sm:text-sm leading-relaxed break-all">
          {content}
        </p>
      );
    };

    

      return (
        <div
        
          className={cn(
            "flex mb-2 sm:mb-3 px-2 sm:px-3 animate-fade-in ",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <div
          onContextMenu={onContextMenu}
            className={cn(
              "flex flex-col w-fit",
              "max-w-[90%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]",
              "rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-soft",
              isOwn
                ? "bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-fg))] rounded-br-md"
                : "bg-[hsl(var(--chat-bubble-received))] text-[hsl(var(--chat-bubble-received-fg))] rounded-bl-md"
            )}
          >
            {/* Content (text / media) */}
            {renderContent()}

            {/* Time + Status */}
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-[11px] sm:text-xs",
                isOwn ? "justify-end opacity-90" : "justify-start opacity-70"
              )}
            >
              <span className="whitespace-nowrap">{timeString}</span>

              {isOwn && (
                <span className="ml-0.5 flex items-center">
                  {!isOnline ? (
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
