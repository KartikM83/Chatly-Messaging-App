// src/components/uiComponent/MessageComposer.jsx
import React, { useEffect, useRef, useState } from "react";
import { GoPaperclip } from "react-icons/go";
import { FiSend } from "react-icons/fi";
import { MdMicNone, MdOutlinePhotoCamera } from "react-icons/md";
import { LuSmile } from "react-icons/lu";
import EmojiPicker from "emoji-picker-react";
import IconButton from "./IconButton";

export default function MessageComposer({
  onSendText,
  onSendFile,
  showAttach = true,
  showEmoji = true,
  showMic = true,
  // ⭐ NEW props for edit mode
  editing = false,
  editingInitialValue = "",
  onCancelEdit,
}) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const composerRef = useRef(null);
  const fileInputRef = useRef(null);

  // ⭐ Jab edit start ho, text load karo. Jab edit finish, clear karo.
  useEffect(() => {
    if (editing) {
      setMessage(editingInitialValue || "");
      setShowEmojiPicker(false);
    } else {
      // normal mode me new blank
      setMessage("");
    }
  }, [editing, editingInitialValue]);

  const handleSend = () => {
    if (message.trim() && onSendText) {
      onSendText(message);
      // normal mode me clear, edit khatam hone ka control parent ke paas hai
      if (!editing) {
        setMessage("");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + (emojiData.emoji || ""));
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onSendFile) onSendFile(file);
    e.target.value = "";
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        composerRef.current &&
        !composerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div ref={composerRef} className="relative bg-card border-t">
      {/* DESKTOP EMOJI PICKER */}
      {showEmojiPicker && showEmoji && !editing && (
        <div className="hidden md:block absolute bottom-14 left-10 z-30 bg-card rounded-xl shadow-lg border w-[480px]">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            skinTonesDisabled={false}
            searchDisabled={false}
            height={380}
            lazyLoadEmojis={true}
            previewConfig={{ showPreview: false }}
            width="100%"
          />
        </div>
      )}

      {/* EDITING BANNER (WhatsApp-style) */}
      {editing && (
        <div className="px-4 pt-2 pb-1 flex items-center justify-between text-xs bg-muted/60 border-b">
          <span className="text-primary font-medium">Editing message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-2">
        <div className="flex items-center gap-2">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={editing ? "Edit message" : "Type a message"}
              rows={5}
              className={cn(
                "w-full px-4 py-3 pr-12 pl-10 border border-primary/50 bg-muted/50 rounded-2xl resize-none text-sm max-h-32 overflow-y-auto",
                "focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-smooth"
              )}
              style={{
                minHeight: "48px",
                height: message.split("\n").length > 1 ? "auto" : "48px",
                outline: "none",
                boxShadow: "none",
              }}
              aria-label="Message input"
            />

            {/* Emoji Icon */}
            {showEmoji && (
              <IconButton
                icon={LuSmile}
                variant="normal"
                ariaLabel="Emoji"
                className="absolute left-0 top-6 -translate-y-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editing) return; // edit mode me emoji picker off (WhatsApp feel)
                  setShowEmojiPicker((prev) => !prev);
                }}
              />
            )}

            {/* Attach & Camera Icons */}
            <div className="absolute right-0 top-6 -translate-y-1/2 flex">
              {showAttach && !editing && (
                <>
                  <IconButton
                    icon={GoPaperclip}
                    variant="normal"
                    ariaLabel="Attach file"
                    onClick={handleAttachClick}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}

              {showEmoji && !editing && (
                <IconButton
                  icon={MdOutlinePhotoCamera}
                  variant="normal"
                  ariaLabel="Open camera"
                />
              )}
            </div>
          </div>

          {/* Send / Mic Button */}
          {message.trim() ? (
            <IconButton
              icon={FiSend}
              variant="primary"
              onClick={handleSend}
              ariaLabel={editing ? "Save edited message" : "Send message"}
              className="mb-2"
            />
          ) : (
            showMic &&
            !editing && (
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

      {/* MOBILE EMOJI PICKER */}
      {showEmojiPicker && showEmoji && !editing && (
        <div className="md:hidden pb-1 flex justify-center">
          <div className="w-full bg-card shadow-lg border-t">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled={false}
              searchDisabled={false}
              height={320}
              lazyLoadEmojis={true}
              previewConfig={{ showPreview: false }}
              width="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
}
