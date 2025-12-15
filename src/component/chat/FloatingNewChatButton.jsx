// src/features/chat/components/FloatingNewChatButton.jsx
import React from "react";
import { LuMessageSquarePlus } from "react-icons/lu";
import IconButton from "../uiComponent/IconButton";


export default function FloatingNewChatButton({ onClick }) {
  return (
    <div className="absolute bottom-28 right-4 md:hidden">
      <IconButton icon={LuMessageSquarePlus} variant="primary" ariaLabel="New Chat" size="xl" onClick={onClick} />
    </div>
  );
}
