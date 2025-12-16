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

/* -------------------------------------------------------
   CONTEXT
------------------------------------------------------- */

const WebSocketContext = createContext({
  client: null,
  connected: false,
});

export const useWebSocketClient = () => useContext(WebSocketContext);

/* -------------------------------------------------------
   PROVIDER
------------------------------------------------------- */

export const WebSocketProvider = ({ children }) => {
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({}); // destination -> subscription
  const [connected, setConnected] = useState(false);

  const { conversationList, getConversationList, setConversationList } =
    useContact();

  const { acknowledgeDelivered, syncDelivered } = useMessage();

  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")?.id;
    } catch {
      return null;
    }
  })();

  /* -------------------------------------------------------
     1) LOAD CONVERSATIONS ONCE
  ------------------------------------------------------- */
  useEffect(() => {
    getConversationList();
  }, []);

  /* -------------------------------------------------------
     2) INIT WEBSOCKET (ONCE)
  ------------------------------------------------------- */
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const wsUrl = base.replace(/\/+$/, "") + "/ws-chat";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      debug: () => {}, // mute logs
    });

    client.onConnect = () => {
      console.log("✅ WS Connected");
      setConnected(true);

      // sync pending delivered messages
      syncDelivered();

      if (!currentUserId) return;

      /* 🔔 USER LEVEL CONVERSATION LIST UPDATE */
      const userTopic = `/topic/users/${currentUserId}/conversations`;

      subscriptionsRef.current[userTopic] = client.subscribe(
        userTopic,
        (msg) => {
          const conv = JSON.parse(msg.body);
          if (!conv?.id) return;

          setConversationList((prev) => {
            if (!Array.isArray(prev)) return [conv];
            return [conv, ...prev.filter((c) => c.id !== conv.id)];
          });
        }
      );
    };

    client.onWebSocketClose = () => {
      console.log("❌ WS Disconnected");
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      Object.values(subscriptionsRef.current).forEach((s) =>
        s?.unsubscribe()
      );
      subscriptionsRef.current = {};
      client.deactivate();
    };
  }, []);

  /* -------------------------------------------------------
     3) CONVERSATION TOPICS (CHAT LIST LOGIC ONLY)
  ------------------------------------------------------- */
  useEffect(() => {
    if (!connected || !clientRef.current) return;
    if (!Array.isArray(conversationList)) return;

    conversationList.forEach((conv) => {
      if (!conv?.id) return;

      const destination = `/topic/conversations/${conv.id}`;
      if (subscriptionsRef.current[destination]) return;

      subscriptionsRef.current[destination] =
        clientRef.current.subscribe(destination, (msg) => {
          const payload = JSON.parse(msg.body);
          const convId = payload.conversationId || conv.id;

          setConversationList((list) =>
            list.map((c) => {
              if (c.id !== convId) return c;

              /* -----------------------------
                 🗑️ DELETE FOR ME
              ----------------------------- */
              if (
                payload.event === "MESSAGE_DELETE" &&
                payload.data?.scope === "ME" &&
                payload.data.userId === currentUserId
              ) {
                return {
                  ...c,
                  lastMessage: payload.data.hasLastMessage
                    ? payload.data.lastMessage
                    : "",
                  lastMessageAt: payload.data.lastMessageAt,
                  lastMessageType: "TEXT",
                };
              }

              /* -----------------------------
                 🗑️ DELETE FOR EVERYONE
              ----------------------------- */
              if (
                payload.event === "MESSAGE_DELETE" &&
                payload.data?.scope === "EVERYONE"
              ) {
                return {
                  ...c,
                  lastMessage: "This message was deleted",
                  lastMessageType: "TEXT",
                  lastMessageAt: payload.data.deletedAt,
                };
              }

              /* -----------------------------
                 ✏️ EDIT MESSAGE
              ----------------------------- */
              if (payload.event === "MESSAGE_EDIT") {
                return {
                  ...c,
                  lastMessage: payload.data.content,
                  lastMessageAt: payload.data.editedAt,
                };
              }

              /* -----------------------------
                 📩 NORMAL MESSAGE
              ----------------------------- */
              if (
                payload.senderId &&
                payload.senderId !== currentUserId
              ) {
                acknowledgeDelivered(convId, payload.id);

                return {
                  ...c,
                  lastMessage: payload.content,
                  lastMessageAt: payload.createdAt,
                  lastMessageType: payload.type,
                };
              }

              return c;
            })
          );
        });
    });
  }, [conversationList, connected]);

  /* -------------------------------------------------------
     CONTEXT VALUE
  ------------------------------------------------------- */
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
