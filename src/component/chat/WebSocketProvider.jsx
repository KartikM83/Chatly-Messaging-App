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
  const isMounted = useRef(false);

  const { setConversationList, getConversationList } = useContact();
  const { syncDelivered } = useMessage();

  // ✅ Fetch conversation list once
  useEffect(() => {
    if (!isMounted.current) {
      getConversationList();
      isMounted.current = true;
    }
  }, []);

  // ✅ Setup WS once
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    const wsUrl = apiBase.replace(/\/+$/, "") + "/ws-chat";
    const socket = new SockJS(wsUrl);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log("[STOMP]", str);
        }
      },
    });

    client.onConnect = () => {
      console.log("✅ WebSocket connected (GLOBAL)");
      setConnected(true);

      // sync delivered messages
      syncDelivered();

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = storedUser?.id;
      if (!currentUserId) return;

      const destination = `/topic/users/${currentUserId}/conversations`;
      console.log("🔔 Subscribed to:", destination);

      client.subscribe(destination, (message) => {
        const data = JSON.parse(message.body);
        console.log("🌍 Conversation update:", data);

        if (!data?.id) return;

        // ✅ SAFE merge (never override with undefined)
        setConversationList((prev) => {
          if (!Array.isArray(prev)) return [data];

          const index = prev.findIndex((c) => c.id === data.id);

          if (index === -1) {
            // new conversation → top
            return [data, ...prev];
          }

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...data,
            lastMessage:
              data.lastMessage ?? updated[index].lastMessage,
            lastMessageAt:
              data.lastMessageAt ?? updated[index].lastMessageAt,
            lastMessageType:
              data.lastMessageType ?? updated[index].lastMessageType,
          };

          return updated;
        });
      });
    };

    client.onDisconnect = () => {
      console.log("🔌 WebSocket disconnected");
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log("❌ WebSocket closed");
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error", frame.headers["message"], frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🧹 Cleaning up WebSocketProvider");
      setConnected(false);
      try {
        client.deactivate();
      } catch (e) {
  console.warn("WS deactivate failed", e);
}
    };
  }, []);

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
