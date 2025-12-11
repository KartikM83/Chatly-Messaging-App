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
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import ProfileSidePanel from "../uiComponent/ProfileSidePanel";
import { FiSend } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

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
    .map(([dateKey, msgs]) => ({
      dateKey,
      date: new Date(msgs[0].timestamp),
      messages: msgs,
    }))
    .sort((a, b) => a.date - b.date);
}

function formatDateLabel(date) {
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

  // ⭐ media preview state
  const [mediaPreview, setMediaPreview] = useState(null); // { file, url, kind }
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  // ⭐ context menu (right-click)
  const [messageContextMenu, setMessageContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });

  // ⭐ EDIT MODE: jo message edit ho raha hai
  const [editingMessage, setEditingMessage] = useState(null);

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();

    const MENU_WIDTH = 176; // w-44 => 11rem ~ 176px
    const MENU_HEIGHT = 120; // thoda bada (Edit + 2 delete)
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
      message,
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
      getConversationList,
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

  const unreadIds = unread.map(m => m?.id).filter(Boolean); // remove null/undefined/''

  if (unreadIds.length > 0) {
    markMessagesAsRead(conversationId, unreadIds);
  }
}, [messagess?.messages]);


  console.log("converstation", conversationById);
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

  // WebSocket
  const clientRef = useRef(null);


useEffect(() => {
  if (!conversationId) return;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const wsUrl = apiBase.replace(/\/+$/, "") + "/ws-chat";

  const socket = new SockJS(wsUrl);
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => console.log(str),
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket");

    client.subscribe(`/topic/conversations/${conversationId}`, async (message) => {
      const data = JSON.parse(message.body);
      console.log("WS Received:", data);

      if (data.event === "MESSAGE_REACTION") {
        return;
      }

      // 🔹 EDIT
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

      // 🔹 DELETE - FIXED VERSION
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

          // ✅ KEY FIX: Refetch conversation list for ALL users
          await getConversationList();
        }

        // 🔹 DELETE FOR ME (only remove locally, don't refetch)
        if (scope === "ME") {
          setMessages((prev) => {
            if (!prev?.messages) return prev;
            const newMessages = prev.messages.filter((m) => m.id !== messageId);
            return { ...prev, messages: newMessages };
          });

          // Update conversation summary if needed
          await getConversationList();
        }

        return;
      }

      const isAck = data.messageId && !data.content;
      if (isAck) {
        addMessage(data);
        return;
      }

      addMessage(data);
      updateConversationSummaryWithMessage(data);
    });

    client.subscribe(`/topic/conversations/${conversationId}/read`, (m) => {
      const updated = JSON.parse(m.body);
      setMessages((prev) => ({
        ...prev,
        messages: prev.messages.map(
          (msg) => updated.find((u) => u.id === msg.id) || msg
        ),
      }));
    });
  };

  client.activate();
  clientRef.current = client;

  return () => {
    if (clientRef.current) clientRef.current.deactivate();
  };
}, [conversationId]);



  // TEXT message (normal send + edit mode)
  const handleSendMessage = async (text) => {
    if (!text || !conversationId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    // ✏️ EDIT MODE
    if (editingMessage) {
      try {
        await editMessageApi(conversationId, editingMessage.id, trimmed);

        // optimistic update (WS se bhi aa jayega)
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

    // 📨 NORMAL SEND
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

  // file selected
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

const handleDeleteMessage = async (scope) => {
  const msg = messageContextMenu.message;
  if (!msg || !conversationId) return;

  try {
    await deleteMessageApi(conversationId, msg.id, scope);

    if (scope === "ME") {
      setMessages(prev => {
        if (!prev?.messages) return prev;
        const newMessages = prev.messages.filter(m => m.id !== msg.id);
        return { ...prev, messages: newMessages };
      });

      // Update conversation summary if that message was the last visible one
      setConversationList(prevList => {
        if (!Array.isArray(prevList)) return prevList;

        // compute new last message text from current state (safer to read messagess state)
        const remaining = (messagess?.messages || []).filter(m => m.id !== msg.id)
          .filter(m => !(m.deleted && m.deletedFor === "EVERYONE"));
        const newLast = remaining.length ? remaining[remaining.length - 1] : null;

        const newLastMessageText = newLast ? (newLast.deleted && newLast.deletedFor === "EVERYONE" ? "This message was deleted" : newLast.content) : "";
        const newLastMessageAt = newLast ? newLast.timestamp : null;

        return prevList.map(conv => conv.id === conversationId
          ? { ...conv, lastMessage: newLastMessageText, lastMessageAt: newLastMessageAt }
          : conv);
      });

      setConversationById(prev => {
        if (!prev) return prev;
        const remaining = (messagess?.messages || []).filter(m => m.id !== msg.id)
          .filter(m => !(m.deleted && m.deletedFor === "EVERYONE"));
        const newLast = remaining.length ? remaining[remaining.length - 1] : null;
        return { ...prev, lastMessage: newLast ? (newLast.deleted && newLast.deletedFor === "EVERYONE" ? "This message was deleted" : newLast.content) : "", lastMessageAt: newLast ? newLast.timestamp : null };
      });

    } else if (scope === "EVERYONE") {
      // optimistic update — mark message deleted for everyone
      setMessages(prev => {
        if (!prev?.messages) return prev;
        const newMessages = prev.messages.map(m =>
          m.id === msg.id
            ? {
                ...m,
                deleted: true,
                deletedFor: "EVERYONE",
                content: "This message was deleted",
                type: "TEXT",
                deletedAt: new Date().toISOString()
              }
            : m
        );
        return { ...prev, messages: newMessages };
      });

      // Now update conversation summary safely using message ID comparison
      setConversationById(prev => {
        if (!prev) return prev;

        // If the deleted message was the last message for this conversation, update the summary
        const lastMsg = messagess?.messages?.[messagess.messages.length - 1];
        if (lastMsg && lastMsg.id === msg.id) {
          const ts = new Date().toISOString();
          return { ...prev, lastMessage: "This message was deleted", lastMessageAt: ts, lastMessageType: "TEXT" };
        }
        return prev;
      });

      setConversationList(prevList => {
        if (!Array.isArray(prevList)) return prevList;
        const lastMsg = messagess?.messages?.[messagess.messages.length - 1];
        return prevList.map(conv => {
          if (conv.id !== conversationId) return conv;
          if (lastMsg && lastMsg.id === msg.id) {
            const ts = new Date().toISOString();
            return { ...conv, lastMessage: "This message was deleted", lastMessageAt: ts, lastMessageType: "TEXT" };
          }
          return conv;
        });
      });
      await   getConversationList();
    }

    
  } catch (err) {
    console.error("Delete message failed", err);
  } finally {
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  }
};


  // ✏️ When user clicks Edit in context menu
  const handleEditMessage = () => {
    const msg = messageContextMenu.message;
    if (!msg || !conversationId) return;

    setEditingMessage(msg); // composer me text set hoga
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
              ? conversationById?.groupProfileImage
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
          // 👇 EDIT MODE props
          editing={!!editingMessage}
          editingInitialValue={editingMessage?.content || ""}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {/* MEDIA PREVIEW OVERLAY */}
      {mediaPreview && (
        <div className="fixed inset-0 z-[1200] bg-black/70 flex items-center justify-center">
          <div className="w-full h-full max-w-xl md:h-[90%] md:rounded-xl bg-card flex flex-col overflow-hidden">
            {/* Top bar */}
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

            {/* Media preview area */}
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

            {/* Caption + send */}
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
      {messageContextMenu.visible && (
        <div
          className="msg-context-menu fixed bg-white rounded-xl shadow-lg border w-44 py-2 text-sm"
          style={{
            top: messageContextMenu.y,
            left: messageContextMenu.x,
            zIndex: 9999,
          }}
        >
          {/* EDIT – only own, not deleted */}
          {messageContextMenu.message?.senderId === currentUserId &&
            !messageContextMenu.message?.deleted &&
            messageContextMenu.message?.deletedFor !== "EVERYONE" &&
            messageContextMenu.message?.content !==
              "This message was deleted" && (
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

          {messageContextMenu.message?.senderId === currentUserId &&
            !messageContextMenu.message?.deleted &&
            messageContextMenu.message?.deletedFor !== "EVERYONE" &&
            messageContextMenu.message?.content !==
              "This message was deleted" && (
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
