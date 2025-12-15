// src/components/chat/ChatWindow.jsx
import { IoMdArrowBack } from "react-icons/io";
import IconButton from "../uiComponent/IconButton";
import Avatar from "../uiComponent/Avatar";
import { LuVideo } from "react-icons/lu";
import { IoCallOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useContact from "../../hooks/contactHook/useContact";
import MessageBubble from "../uiComponent/MessageBubble";
import MessageComposer from "../uiComponent/MessageComposer";
import { useMessage } from "../../hooks/messageHook/useMessage";
import ProfileSidePanel from "../uiComponent/ProfileSidePanel";
import { FiSend } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useWebSocketClient } from "../chat/WebSocketProvider";
import { resolveLastMessage } from "../../utils/resolveLastMessage";
import { HiUsers } from "react-icons/hi";
import { FaUser } from "react-icons/fa6";

function groupMessagesByDate(messages = []) {
  const map = new Map();

  messages.forEach((msg) => {
    if (!msg?.timestamp) return;

    const d = new Date(msg.timestamp);
    const dateKey = d.toDateString();

    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey).push(msg);
  });

  return Array.from(map.entries())
    .map(([dateKey, msgs]) => {
      const ts = msgs[0]?.timestamp || 0;
      const d = new Date(ts);
      return {
        dateKey,
        date: isNaN(d.getTime()) ? new Date(0) : d,
        messages: msgs,
      };
    })
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
}

function formatDateLabel(date) {
  if (!date || isNaN(date.getTime())) {
    return new Date(date).toLocaleDateString?.() || "";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const scrollContainerRef = useRef(null);

  // Media preview state
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  // Context menu (right-click)
  const [messageContextMenu, setMessageContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });

  // Edit mode
  const [editingMessage, setEditingMessage] = useState(null);

  // ⭐ Use global WebSocket client
  const { client: wsClient, connected: wsConnected } = useWebSocketClient();
  const conversationSubscriptionRef = useRef(null);
  const readReceiptsSubscriptionRef = useRef(null);

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();

    const MENU_WIDTH = 176;
    const MENU_HEIGHT = 120;
    const PADDING = 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (x + MENU_WIDTH + PADDING > vw) {
      x = vw - MENU_WIDTH - PADDING;
    }

    if (y + MENU_HEIGHT + PADDING > vh) {
      y = vh - MENU_HEIGHT - PADDING;
    }

    setMessageContextMenu({
      visible: true,
      x,
      y,
      messageId: message.id,
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (!messageContextMenu.visible) return;
      if (!e.target.closest(".msg-context-menu")) {
        setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [messageContextMenu]);

  const {
    fetchConversationById,
    conversationById,
    setConversationById,
    setConversationList,
    // getConversationList,
  } = useContact();

  const {
    fetchMessagesById,
    messagess,
    addMessage,
    fetchSendMessagesById,
    markMessagesAsRead,
    setMessages,
    sendMediaMessage,
    deleteMessage: deleteMessageApi,
    editMessage: editMessageApi,
  } = useMessage();

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversationById(conversationId);
      fetchMessagesById(conversationId);
    }
  }, [conversationId]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?.id;

  useEffect(() => {
    if (!messagess?.messages || messagess.messages.length === 0) return;
    if (!currentUserId) return;

    const unread = messagess.messages.filter(
      (m) => m && m.senderId !== currentUserId && m.status !== "SEEN"
    );

    const unreadIds = unread.map((m) => m?.id).filter(Boolean);

    if (unreadIds.length > 0) {
      markMessagesAsRead(conversationId, unreadIds);
    }
  }, [messagess?.messages]);

  const isGroupConversation = conversationById?.type === "GROUP";

  const otherParticipant =
    conversationById?.type === "GROUP"
      ? null
      : conversationById?.participants?.find((p) => p.id !== currentUserId);

  const profileContact =
    conversationById?.type === "GROUP"
      ? {
          id: conversationById?.id,
          name: conversationById?.groupName,
          profileImage: conversationById?.groupProfileImage,
          bio: conversationById?.groupDescription || "",
          phoneNumber: conversationById?.phoneNumber || "",
          groupParticipants: conversationById?.participants || [],
          adminId: conversationById?.adminId || "",
        }
      : otherParticipant;

  const isSelfProfile = profileContact?.id === currentUserId;
  const canEditConversation =
    isGroupConversation && conversationById?.adminId === currentUserId;

  function updateConversationSummaryWithMessage(msg) {
    const conversationIdOfMsg = msg.conversationId || conversationId;
    const timestamp = msg.createdAt || new Date().toISOString();

    setConversationById((prev) => {
      if (!prev || prev.id !== conversationIdOfMsg) return prev;
      return {
        ...prev,
        lastMessage: msg.content,
        lastMessageAt: timestamp,
      };
    });

    setConversationList((prevList) => {
      if (!Array.isArray(prevList)) return prevList;

      const updated = prevList.reduce((acc, conv) => {
        if (!conv) return acc;
        if (conv.id === conversationIdOfMsg) {
          const newConv = {
            ...conv,
            lastMessage: msg.content,
            lastMessageAt: timestamp,
          };
          return [newConv, ...acc];
        } else {
          acc.push(conv);
          return acc;
        }
      }, []);

      const found = prevList.some((c) => c?.id === conversationIdOfMsg);
      if (!found) {
        const newItem = {
          id: conversationIdOfMsg,
          lastMessage: msg.content,
          lastMessageAt: timestamp,
        };
        return [newItem, ...prevList];
      }

      return updated;
    });
  }

  // ⭐ Subscribe to conversation-specific topics using global WS client
  useEffect(() => {
    if (!conversationId || !wsClient || !wsConnected) return;

    console.log("🔔 ChatWindow subscribing to:", conversationId);

    // Subscribe to conversation messages
    conversationSubscriptionRef.current = wsClient.subscribe(
      `/topic/conversations/${conversationId}`,
      async (message) => {
        const data = JSON.parse(message.body);
        console.log("💬 ChatWindow received:", data);

        if (data.event === "CONVERSATION_UPDATE") {
          return;
        }

        if (data.event === "MESSAGE_REACTION") {
          return;
        }

        // MESSAGE_EDIT
        if (data.event === "MESSAGE_EDIT") {
          const updated = data.data || {};
          const { id, content, editedAt } = updated;

          if (!id) return;

          let wasLast = false;

          setMessages((prev) => {
            if (!prev?.messages) return prev;

            const prevMessages = prev.messages;
            const lastMsg = prevMessages[prevMessages.length - 1];
            wasLast = lastMsg?.id === id;

            const newMessages = prevMessages.map((m) =>
              m.id === id
                ? {
                    ...m,
                    content,
                    edited: true,
                    editedAt: editedAt || m.editedAt,
                  }
                : m
            );

            return { ...prev, messages: newMessages };
          });

          if (wasLast) {
            setConversationById((prev) => {
              if (!prev || prev.id !== conversationId) return prev;
              return {
                ...prev,
                lastMessage: content,
                lastMessageAt: editedAt || prev.lastMessageAt,
              };
            });

            setConversationList((prevList) => {
              if (!Array.isArray(prevList)) return prevList;
              return prevList.map((conv) =>
                conv.id === conversationId
                  ? {
                      ...conv,
                      lastMessage: content,
                      lastMessageAt: editedAt || conv.lastMessageAt,
                    }
                  : conv
              );
            });
          }

          return;
        }

        // MESSAGE_DELETE
        if (data.event === "MESSAGE_DELETE") {
          const { messageId, scope, deletedAt } = data.data || {};

          if (scope === "EVERYONE") {
            let wasLast = false;

            setMessages((prev) => {
              if (!prev?.messages) return prev;

              const prevMessages = prev.messages;
              const lastMsg = prevMessages[prevMessages.length - 1];
              wasLast = lastMsg?.id === messageId;

              const updatedMessages = prevMessages.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      deleted: true,
                      deletedFor: "EVERYONE",
                      content: "This message was deleted",
                      type: "TEXT",
                      deletedAt: deletedAt || m.deletedAt,
                    }
                  : m
              );

              return { ...prev, messages: updatedMessages };
            });

            if (wasLast) {
              setConversationById((prev) => {
                if (!prev || prev.id !== conversationId) return prev;
                return {
                  ...prev,
                  lastMessage: "This message was deleted",
                  lastMessageType: "TEXT",
                  lastMessageAt: deletedAt || prev.lastMessageAt,
                };
              });

              setConversationList((prevList) => {
                if (!Array.isArray(prevList)) return prevList;
                return prevList.map((conv) =>
                  conv.id === conversationId
                    ? {
                        ...conv,
                        lastMessage: "This message was deleted",
                        lastMessageType: "TEXT",
                        lastMessageAt: deletedAt || conv.lastMessageAt,
                      }
                    : conv
                );
              });
            }
          }

          if (scope === "ME") {
            setMessages((prev) => {
              if (!prev?.messages) return prev;
              const newMessages = prev.messages.filter(
                (m) => m.id !== messageId
              );
              return { ...prev, messages: newMessages };
            });
          }

          return;
        }

        // ACK-only events
        const isAck = data.messageId && !data.content;
        if (isAck) {
          addMessage(data);
          return;
        }

        // Regular messages
        addMessage(data);
        updateConversationSummaryWithMessage(data);
      }
    );

    // Subscribe to read receipts
    readReceiptsSubscriptionRef.current = wsClient.subscribe(
      `/topic/conversations/${conversationId}/read`,
      (m) => {
        const updated = JSON.parse(m.body);
        setMessages((prev) => {
          if (!prev || !Array.isArray(prev.messages)) return prev;
          return {
            ...prev,
            messages: prev.messages.map(
              (msg) => updated.find((u) => u.id === msg.id) || msg
            ),
          };
        });
      }
    );

    // Cleanup subscriptions when conversationId changes or component unmounts
    return () => {
      console.log("🧹 ChatWindow unsubscribing from:", conversationId);
      if (conversationSubscriptionRef.current) {
        conversationSubscriptionRef.current.unsubscribe();
        conversationSubscriptionRef.current = null;
      }
      if (readReceiptsSubscriptionRef.current) {
        readReceiptsSubscriptionRef.current.unsubscribe();
        readReceiptsSubscriptionRef.current = null;
      }
    };
  }, [conversationId, wsClient, wsConnected]);

  // TEXT message (normal send + edit mode)
  const handleSendMessage = async (text) => {
    if (!text || !conversationId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      try {
        await editMessageApi(conversationId, editingMessage.id, trimmed);

        setMessages((prev) => ({
          ...prev,
          messages: (prev.messages || []).map((m) =>
            m.id === editingMessage.id
              ? { ...m, content: trimmed, edited: true }
              : m
          ),
        }));
      } catch (err) {
        console.error("Edit error:", err);
      } finally {
        setEditingMessage(null);
      }
      return;
    }

    const clientMessageId = crypto.randomUUID();

    const messageBody = {
      content: trimmed,
      type: "TEXT",
      clientMessageId,
    };

    try {
      await fetchSendMessagesById(conversationId, messageBody);
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    let kind = "file";

    if (file.type.startsWith("image/")) kind = "image";
    else if (file.type.startsWith("video/")) kind = "video";

    setMediaPreview({ file, url, kind });
    setMediaCaption("");
    setMediaUploadProgress(0);
    setMediaUploading(false);
  };

  const clearMediaPreview = () => {
    if (mediaPreview?.url) {
      URL.revokeObjectURL(mediaPreview.url);
    }
    setMediaPreview(null);
    setMediaCaption("");
    setMediaUploadProgress(0);
    setMediaUploading(false);
  };

  const handleConfirmSendMedia = async () => {
    if (!mediaPreview || !conversationId) return;

    try {
      setMediaUploading(true);
      setMediaUploadProgress(0);

      await sendMediaMessage(
        conversationId,
        mediaPreview.file,
        mediaCaption,
        (percent) => {
          setMediaUploadProgress(percent);
        }
      );

      clearMediaPreview();
    } catch (err) {
      console.error("Send media error:", err);
      setMediaUploading(false);
    }
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [messagess?.messages]);

  if (!conversationId) {
    return (
      <div className="hidden md:flex w-full h-full items-center justify-center text-muted-foreground">
        Select a conversation to start chatting
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messagess?.messages || []);
  const selectedMessage = messagess?.messages?.find(
    (m) => m.id === messageContextMenu.messageId
  );

  const handleDeleteMessage = async (scope) => {
    const msg = selectedMessage;
    if (!msg || !conversationId) return;

    try {
      await deleteMessageApi(conversationId, msg.id, scope);

      const currentMessages = messagess?.messages || [];

      // =========================
      // DELETE FOR ME
      // =========================
      if (scope === "ME") {
        const remaining = currentMessages.filter((m) => m.id !== msg.id);

        const { text, time } = resolveLastMessage(remaining);

        // ✅ 1) Update messages atom
        setMessages((prev) => ({
          ...prev,
          messages: remaining,
        }));

        // ✅ 2) Update conversation atoms (SEPARATELY)
        setConversationList((list) =>
          list.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: text, lastMessageAt: time }
              : c
          )
        );

        setConversationById((c) =>
          c ? { ...c, lastMessage: text, lastMessageAt: time } : c
        );

        return;
      }

      // =========================
      // DELETE FOR EVERYONE
      // =========================
      if (scope === "EVERYONE") {
        const updated = currentMessages.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                deleted: true,
                deletedFor: "EVERYONE",
                content: "This message was deleted",
                type: "TEXT",
                deletedAt: new Date().toISOString(),
              }
            : m
        );

        const { text, time } = resolveLastMessage(updated);

        // ✅ 1) Update messages atom
        setMessages((prev) => ({
          ...prev,
          messages: updated,
        }));

        // ✅ 2) Update conversation atoms (SEPARATELY)
        setConversationList((list) =>
          list.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: text, lastMessageAt: time }
              : c
          )
        );

        setConversationById((c) =>
          c ? { ...c, lastMessage: text, lastMessageAt: time } : c
        );

        return;
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setMessageContextMenu({
        visible: false,
        x: 0,
        y: 0,
        messageId: null,
      });
    }
  };

  const handleEditMessage = () => {
  if (!selectedMessage || !conversationId) return;

    setEditingMessage(selectedMessage);
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden relative">
      {/* HEADER */}
      <div
        className="flex items-center gap-1 p-4 border-b shadow-soft"
        onClick={() => setOpenProfile((prev) => !prev)}
      >
        <IconButton
          icon={IoMdArrowBack}
          variant="ghost"
          onClick={() => navigate("/chats")}
          ariaLabel="Back"
          className="md:hidden"
        />

        <Avatar
          src={
            conversationById?.type === "GROUP"
              ? conversationById?.groupProfileImage ||  (conversationById?.type ==="GROUP" ? <HiUsers />: <FaUser /> )
              : otherParticipant?.profileImage
          }
          alt={otherParticipant?.name}
          size="md"
          status={otherParticipant?.status || null}
        />

        <div className="flex-1 min-w-0 ml-2">
          <h2 className="font-medium text-sm truncate w-[110px] md:w-full">
            {conversationById?.type === "GROUP"
              ? conversationById?.groupName
              : otherParticipant?.name || "Unknown"}
          </h2>

          <p className="text-xs text-muted-foreground truncate">
            {otherParticipant?.status === "online"
              ? "online"
              : otherParticipant?.lastSeen || ""}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton icon={LuVideo} variant="ghost" />
          <IconButton icon={IoCallOutline} variant="ghost" />
          <IconButton icon={BsThreeDotsVertical} variant="ghost" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollContainerRef}>
        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="font-medium mb-1 text-muted-foreground">
              No messages yet
            </p>
            <p className="text-sm text-muted-foreground">
              Say hello to start the conversation 👋
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.dateKey}>
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                    {formatDateLabel(group.date)}
                  </span>
                </div>

                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    onContextMenu={(e) => handleMessageRightClick(e, message)}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* MESSAGE INPUT */}
      <div className="w-full md:left-[416px] md:w-full">
        <MessageComposer
          onSendText={handleSendMessage}
          onSendFile={handleFileSelected}
          editing={!!editingMessage}
          editingInitialValue={editingMessage?.content || ""}
          onCancelEdit={handleCancelEdit}
          
        />
      </div>

      {/* MEDIA PREVIEW OVERLAY */}
      {mediaPreview && (
        <div className="fixed inset-0 z-[1200] bg-black/70 flex items-center justify-center">
          <div className="w-full h-full max-w-xl md:h-[90%] md:rounded-xl bg-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <button
                onClick={clearMediaPreview}
                className="text-white md:text-foreground flex items-center gap-1"
              >
                <IoMdArrowBack className="w-5 h-5 hidden md:inline " />
                <span className="text-sm hidden md:inline">Back</span>
                <span className="text-sm text-black md:hidden">
                  <RxCross1 className="w-5 h-5" />
                </span>
              </button>
              <span className="text-xs md:text-sm text-muted-foreground">
                Preview
              </span>
              <div className="w-6" />
            </div>

            <div className="flex-1 bg-card flex items-center justify-center overflow-hidden">
              {mediaPreview.kind === "image" && (
                <img
                  src={mediaPreview.url}
                  alt="preview"
                  className="max-h-full max-w-full object-contain"
                />
              )}

              {mediaPreview.kind === "video" && (
                <video
                  src={mediaPreview.url}
                  controls
                  autoPlay
                  className="max-h-full max-w-full"
                />
              )}

              {mediaPreview.kind === "file" && (
                <div className="text-center px-6 text-black flex flex-col items-center gap-2">
                  <FaFileAlt className="w-10 h-10" />
                  <p className="text-sm ">File selected</p>
                  <p className="text-xs opacity-80 break-all">
                    {mediaPreview.file.name}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-border bg-card">
              <div className="flex items-center gap-2 px-3 py-2">
                <textarea
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="Add a caption (optional)"
                  rows={2}
                  className="flex-1 bg-transparent text-sm resize-none outline-none border-none px-2 py-1 max-h-20"
                />
                <IconButton
                  icon={FiSend}
                  variant="primary"
                  ariaLabel="Send media"
                  onClick={handleConfirmSendMedia}
                  disabled={mediaUploading}
                />
              </div>

              {mediaUploading && (
                <div className="px-4 pb-3">
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${mediaUploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground text-right">
                    {Math.round(mediaUploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SIDE PANEL */}
      <ProfileSidePanel
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        contact={profileContact}
        isSelf={isSelfProfile}
        conversationId={conversationId}
        isGroup={isGroupConversation}
        canEditConversation={canEditConversation}
        onConversationUpdated={(updatedConv) => {
          setConversationById(updatedConv);
        }}
      />

      {/* CONTEXT MENU */}
      {messageContextMenu.visible && selectedMessage && (
        <div
          className="msg-context-menu fixed bg-white rounded-xl shadow-lg border w-44 py-2 text-sm"
          style={{
            top: messageContextMenu.y,
            left: messageContextMenu.x,
            zIndex: 9999,
          }}
        >
          {/* EDIT */}
          {selectedMessage.senderId === currentUserId &&
            !selectedMessage.deleted &&
            selectedMessage.deletedFor !== "EVERYONE" && (
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleEditMessage}
              >
                Edit
              </button>
            )}

          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => handleDeleteMessage("ME")}
          >
            Delete for me
          </button>

          {/* DELETE FOR EVERYONE */}
          {selectedMessage.senderId === currentUserId &&
            !selectedMessage.deleted &&
            selectedMessage.deletedFor !== "EVERYONE" && (
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteMessage("EVERYONE")}
              >
                Delete for everyone
              </button>
            )}
        </div>
      )}
    </div>
  );
}
