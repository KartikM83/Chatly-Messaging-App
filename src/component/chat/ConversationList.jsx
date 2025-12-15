// src/features/chat/components/ConversationList.jsx
import React from "react";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onItemClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-6">
        <p className="text-lg font-medium">No chats yet</p>
        <p className="text-sm">Select a contact to start a conversation</p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation?.id}
          conversation={conversation}
          currentUserId={currentUserId}
          isActive={activeConversationId === conversation.id}
          onClick={() => onItemClick(conversation.id)}
          onContextMenu={(e) => onContextMenu(e, conversation.id)}
          onTouchStart={() => onTouchStart(conversation.id)}
          onTouchEnd={onTouchEnd}
        />
      ))}
    </div>
  );
}
