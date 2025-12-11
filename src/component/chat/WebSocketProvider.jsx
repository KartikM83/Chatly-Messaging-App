// src/websocket/WebSocketProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import useContact from "../../hooks/contactHook/useContact";
import { useMessage } from "../../hooks/messageHook/useMessage";

const WebSocketContext = createContext({
  client: null,
  connected: false,
});

export const useWebSocketClient = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const subscriptionsRef = useRef({}); // { [destination]: subscription }

  const { conversationList, getConversationList, setConversationList } =
    useContact();
  const { acknowledgeDelivered, syncDelivered } = useMessage();

  // 1) Fetch conversation list once (or you can skip if already fetched elsewhere)
  useEffect(() => {
    getConversationList();
  }, []);

  // 2) Setup WS client once
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    const wsUrl = apiBase.replace(/\/+$/, "") + "/ws-chat";
    const socket = new SockJS(wsUrl);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
    });

    client.onConnect = () => {
      console.log("✅ Global WebSocket connected");
      setConnected(true);

      console.log("[WS] Connected, syncing delivered messages...");
      syncDelivered();

      // ⭐ Subscribe to "conversation events" for this user
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = storedUser?.id;

      if (currentUserId) {
        const destination = `/topic/users/${currentUserId}/conversations`;
        console.log("🔔 Subscribing to user conversation topic:", destination);

        const sub = client.subscribe(destination, (message) => {
          const data = JSON.parse(message.body);
          console.log("🌍 New/updated conversation via WS:", data);

          // data is ConversationResponseDTO from backend
          setConversationList((prev) => {
            const conv = data;
            if (!conv || !conv.id) return prev;

            if (!Array.isArray(prev) || prev.length === 0) {
              return [conv];
            }

            // remove existing instance if any (no duplicates)
            const without = prev.filter((c) => c && c.id !== conv.id);

            // put new/updated conversation at top
            return [conv, ...without];
          });
        });

        // store subscription so we can clean up if needed
        subscriptionsRef.current[destination] = sub;
      }
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error", frame.headers["message"], frame.body);
    };

    client.onWebSocketClose = () => {
      console.log("❌ WebSocket closed");
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🧹 Cleaning up global WS");
      setConnected(false);
      Object.values(subscriptionsRef.current).forEach((sub) =>
        sub.unsubscribe()
      );
      subscriptionsRef.current = {};
      client.deactivate();
    };
  }, []);

  // 3) Subscribe to ALL conversation topics when we know them
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected) return;
    if (!Array.isArray(conversationList)) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser?.id;

    conversationList.forEach((conversation) => {
      if (!conversation || !conversation.id) return;

      const destination = `/topic/conversations/${conversation.id}`;

      // Already subscribed? Skip.
      if (subscriptionsRef.current[destination]) {
        return;
      }

      console.log("🔔 Global subscribe:", destination);

      const subscription = client.subscribe(destination, async (message) => {
        const data = JSON.parse(message.body);
        console.log("🌍 Global WS event from", destination, data);

        // ✅ Handle MESSAGE_DELETE events globally
        if (data.event === "MESSAGE_DELETE") {
          const { messageId, scope, deletedAt } = data.data || {};

          if (scope === "EVERYONE") {
            console.log("🗑️ Global delete for everyone detected:", messageId);

            // Refetch conversation list to update lastMessage for ALL users
            await getConversationList();
          }

          if (scope === "ME") {
            console.log("🗑️ Global delete for me detected:", messageId);
            // Still refetch to ensure consistency
            await getConversationList();
          }

          return;
        }

        // ✅ Handle MESSAGE_EDIT events globally
        if (data.event === "MESSAGE_EDIT") {
          const { id, content } = data.data || {};

          console.log("✏️ Global edit detected:", id);

          // Refetch conversation list to update lastMessage if it was edited
          await getConversationList();
          return;
        }

        // -----------------------------
        // 1. ACK-only events (no content)
        // -----------------------------
        const isAck = data.messageId && !data.content;
        if (isAck) {
          // Let ChatWindow handle updating message status UI
          return;
        }

        // -----------------------------
        // 2. REAL incoming messages
        // -----------------------------
        // If I'm not the sender, I am the receiver -> send DELIVERED ACK
        if (data.senderId && data.senderId !== currentUserId) {
          console.log("📩 Passive ACK for message:", data.id);

          // REST call → will trigger backend to mark DELIVERED and broadcast ACK
          acknowledgeDelivered(data.conversationId || conversation.id, data.id);

          // Update chat list preview (lastMessage/lastMessageAt)
          setConversationList((prevList) => {
            if (!Array.isArray(prevList)) return prevList;
            return prevList.map((conv) =>
              conv.id === (data.conversationId || conversation.id)
                ? {
                    ...conv,
                    lastMessage: data.content,
                    lastMessageAt: data.timestamp,
                  }
                : conv
            );
          });
        }

        // Note: We do NOT call addMessage here,
        // ChatWindow's own WS or HTTP fetch will handle detailed message list.
      });

      subscriptionsRef.current[destination] = subscription;
    });
  }, [
    conversationList,
    connected,
    acknowledgeDelivered,
    setConversationList,
    getConversationList,
  ]);

  return (
    <WebSocketContext.Provider
      value={{
        client: clientRef.current,
        connected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
