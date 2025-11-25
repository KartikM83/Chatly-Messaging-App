import { IoMdArrowBack } from "react-icons/io";
import IconButton from "../uiComponent/IconButton";
import Avatar from "../uiComponent/Avatar";
import { LuVideo } from "react-icons/lu";
import { IoCallOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import useContact from "../../hooks/contactHook/useContact";
import MessageBubble from "../uiComponent/MessageBubble";
import MessageComposer from "../uiComponent/MessageComposer";
import {useMessage} from "../../hooks/messageHook/useMessage";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const { fetchConversationById, conversationById, loading, error,conversationList,setConversationList,setConversationById } =
    useContact();

  const { fetchMessagesById, messagess, addMessage,fetchSendMessagesById  } = useMessage();



  function updateConversationSummaryWithMessage(msg) {
  // msg should contain at least: conversationId (or conversationId param), content, senderId, createdAt (ISO or epoch)
  const conversationIdOfMsg = msg.conversationId || conversationId; // fallback if server doesn't include it
  const timestamp = msg.createdAt || new Date().toISOString();

  // Update conversationById cache (if this window's conversation is open)
  setConversationById(prev => {
    if (!prev || prev.id !== conversationIdOfMsg) return prev;
    return {
      ...prev,
      lastMessage: msg.content,
      lastMessageAt: timestamp,
      // optionally add lastSender, lastMessageType, etc.
    };
  });

  // Update conversationList: update lastMessage/lastMessageAt and move to top
  setConversationList(prevList => {
    if (!Array.isArray(prevList)) return prevList;

    // Find the conversation and update it
    const updated = prevList.reduce((acc, conv) => {
      if (!conv) return acc;
      if (conv.id === conversationIdOfMsg) {
        const newConv = {
          ...conv,
          lastMessage: msg.content,
          lastMessageAt: timestamp,
        };
        // put updated conversation at start
        return [newConv, ...acc];
      } else {
        acc.push(conv);
        return acc;
      }
    }, []);

    // if message's conversation wasn't present in list, optionally add it:
    const found = prevList.some(c => c?.id === conversationIdOfMsg);
    if (!found) {
      const newItem = {
        id: conversationIdOfMsg,
        lastMessage: msg.content,
        lastMessageAt: timestamp,
        // add other minimal fields so chat list can render (groupName or participants...)
      };
      return [newItem, ...prevList];
    }

    // Remove duplicates while preserving order (we moved updated to top already)
    // But the reduce above created list with updated first then older ones.
    return updated;
  });
}



  // Fetch conversation + messages
  useEffect(() => {
    if (conversationId) {
      fetchConversationById(conversationId);
      fetchMessagesById(conversationId);
    }
  }, [conversationId]);

  // Real-time WebSocket Listener
  const clientRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const socket = new SockJS("http://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      // ⭐ CORRECT TOPIC
      client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("WS Received:", data);

        // ⭐ ADD MESSAGE INTO UI
        addMessage(data);
         updateConversationSummaryWithMessage(data);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, [conversationId]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?.id;

  const otherParticipant = conversationById?.participants?.find(
    (p) => p.id !== currentUserId
  );


  const handleSendMessage = async (text) => {
  if (!text || !conversationId) return;

  const clientMessageId = crypto.randomUUID(); // unique ID from frontend

  console.log("text", text)
  console.log("clientMessageId", clientMessageId)


  const messageBody = {
    content: text,
    type: "TEXT",
    clientMessageId,
  };

  console.log("messageBody", messageBody)

  try {
    // Send to backend
    const sentMessage = await fetchSendMessagesById(
      conversationId,
      messageBody
    );

    console.log("Message sent:", sentMessage);
  } catch (err) {
    console.error("Send error:", err);
  }
};

  // Auto-scroll on new message
  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messagess?.messages]);



  if (!conversationId) {
    return (
      <div className="hidden md:flex w-full h-full items-center justify-center text-muted-foreground">
        Select a conversation to start chatting
      </div>
    );
  }


  

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-1 p-4 border-b shadow-soft">
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
          <h2 className="font-medium text-sm truncate w-[140px] md:w-full">
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
      <div className="flex-1 overflow-y-auto p-4 ">
        {messagess?.messages.length === 0 ? (
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
      {messagess?.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} /> {/* ← dummy div for auto-scroll */}
    </>
  )}
      </div>

      {/* MESSAGE INPUT */}
      {/* <div className="fixed bottom-0 w-full md:left-[416px] md:w-[calc(100%-416px)]">
        <MessageComposer />
      </div> */}

      <div className="w-full md:left-[416px] md:w-full">
        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  );
}
