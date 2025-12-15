// src/features/chat/components/ChatHeader.jsx
import React from "react";
import { LuMessageSquarePlus, LuArchive } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import IconButton from "../uiComponent/IconButton";
import SearchInput from "../uiComponent/SearchInput";


export default function ChatHeader({
  onNewChat,
  searchQuery,
  setSearchQuery,
  openbox,
  setOpenbox,
}) {
  return (
    <div className="p-2 border-b">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading font-bold">
          <span className="hidden md:inline">Chats</span>
          <span className="inline md:hidden">Chatly</span>
        </h1>

        <div className="hidden md:block">
          <IconButton
            icon={LuMessageSquarePlus}
            variant="primary"
            ariaLabel="New Chat"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onNewChat();
            }}
          />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <IconButton
            icon={LuArchive}
            variant="normal"
            ariaLabel="Archive Chat"
            size="md"
            onClick={() => console.log("Mobile archive")}
          />
          <IconButton
            icon={BsThreeDotsVertical}
            variant="normal"
            ariaLabel="More Options"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              setOpenbox((prev) => !prev);
            }}
          />
        </div>
      </div>

      {openbox && (
        <div className="absolute z-[1000] top-12 right-1 rounded-xl w-48 bg-card py-4 flex flex-col gap-2 shadow-[0_0_12px_rgba(0,0,0,0.2)]">
          <span className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition">
            Starred
          </span>
          <span
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition"
            onClick={() => (window.location.href = "/settings")}
          >
            Settings
          </span>
        </div>
      )}

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search or start a new chat"
      />
    </div>
  );
}
