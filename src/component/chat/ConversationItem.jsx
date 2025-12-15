// src/features/chat/components/ConversationItem.jsx
import React from "react";

import { LuPin, LuVideo } from "react-icons/lu";
import { MdInsertPhoto } from "react-icons/md";
import { FaHeadphones, FaFileAlt } from "react-icons/fa";
import Avatar from "../uiComponent/Avatar";
import { HiUsers } from "react-icons/hi";
import { FaUser } from "react-icons/fa6";

function formatLastMessage(conversation) {
  const text = conversation.lastMessage || " ";
  console.log("chatlist lastmessage", text);
  const type = (conversation.lastMessageType || "").toUpperCase();

  const getFileName = (url) => {
    try {
      const clean = url.split("?")[0];
      const full = decodeURIComponent(clean.split("/").pop() || "");
      const parts = full.split("_");
      if (parts.length >= 3) return parts.slice(2).join("_");
      return full;
    } catch {
      return "file";
    }
  };

  if (type === "TEXT") return text;
  if (type === "IMAGE" || /\.(jpg|jpeg|png|gif|webp)$/i.test(text))
    return (
      <span className="flex items-center gap-1">
        <MdInsertPhoto size={15} /> Photo
      </span>
    );
  if (type === "VIDEO")
    return (
      <span className="flex items-center gap-1">
        <LuVideo size={15} /> Video
      </span>
    );
  if (type === "AUDIO")
    return (
      <span className="flex items-center gap-1">
        <FaHeadphones size={15} /> Audio
      </span>
    );
  if (type === "FILE" || type === "DOCUMENT")
    return (
      <span className="flex items-center gap-1">
        <FaFileAlt size={15} /> {getFileName(conversation.lastMessage)}
      </span>
    );
  return "";
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
}) {
  if (!conversation) return null;

  let displayName = "";
  let displayImage = "";

  if (conversation.type === "DIRECT") {
    const otherUser = (conversation.participants || []).find(
      (p) => p.id !== currentUserId
    );
    displayName = otherUser?.name;
    displayImage = otherUser?.profileImage;
  }

  if (conversation.type === "GROUP") {
    displayName = conversation.groupName;
    displayImage = conversation?.groupProfileImage;
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3  cursor-pointer ${
        isActive ? "bg-muted/60" : "hover:bg-muted/50"
      }`}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Avatar src={displayImage ||  (conversation.type ==="GROUP" ? <HiUsers />: <FaUser /> )} alt={displayName} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="flex h-5 items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate flex items-center gap-1.5">
            {displayName}
            {conversation.pinned && (
              <LuPin className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </h3>
          <span className="text-xs text-muted-foreground">
            {conversation.lastMessageAt
              ? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : conversation.createdAt ? new Date(conversation.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }):"" }
          </span>
        </div>

        <div className="flex h-5 justify-between items-center ">
          <p className="flex-1 w-40 text-sm text-muted-foreground truncate">
            {console.log("chatlist lastmessage", conversation.lastMessage)}
            {formatLastMessage(conversation)}
          </p>
          {conversation.unreadCount === 0 ? (
            ""
          ) : (
            <div className="bg-primary font-heading text-white text-[11px] px-2 py-0.5 flex items-center justify-center rounded-full">
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
