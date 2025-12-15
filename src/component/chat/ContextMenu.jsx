// src/features/chat/components/ContextMenu.jsx
import React from "react";
import { RiDeleteBin6Line, RiUnpinLine } from "react-icons/ri";
import { BsPinAngle } from "react-icons/bs";
import { LuArchive } from "react-icons/lu";

export default function ContextMenu({ x, y, conversation, onAction }) {
  return (
    <div
      className="hidden md:block context-menu absolute bg-white rounded-xl shadow-lg border w-44 py-2"
      style={{ top: y, left: x, zIndex: 9 }}
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => onAction("pin")}
      >
        {conversation?.pinned ? (
          <div className="flex items-center gap-1">
            <RiUnpinLine className="w-5 h-5" /> Unpin Chat
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <BsPinAngle className="w-5 h-5" /> Pin Chat
          </div>
        )}
      </button>

      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => onAction("archive")}
      >
        <div className="flex items-center gap-1">
          <LuArchive className="w-5 h-5" /> Archive Chat
        </div>
      </button>

      <button
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
        onClick={() => onAction("delete")}
      >
        <div className="flex items-center gap-1">
          <RiDeleteBin6Line className="w-5 h-5" /> Delete Chat
        </div>
      </button>

      {conversation?.type === "GROUP" && (
        <button
          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
          onClick={() => onAction("leave")}
        >
          <div className="flex items-center gap-1">
            <RiDeleteBin6Line className="w-5 h-5" /> Exit Group
          </div>
        </button>
      )}
    </div>
  );
}
