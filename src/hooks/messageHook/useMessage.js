import { useState } from "react";
import useFetch from "../useFetch";
import { useRecoilState } from "recoil";
import { messageAtom } from "../../state/messageState/MessageState";
import conf from "../../config";

export const useMessage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchData] = useFetch();
  const [messagess, setMessages] = useRecoilState(messageAtom);
  const [error, setError] = useState(null);

  // ================================
  // FETCH ALL MESSAGES BY CONVERSATION ID
  // ================================
  const fetchMessagesById = async (conversationId) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetchData({
        method: "GET",
        url: `${conf.apiBaseUrl}conversation/${conversationId}/messages`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res); // Save message list
    } catch (err) {
      setError(err);
      console.error("Error fetching Messages: ", err);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // ADD MESSAGE (WebSocket incoming)
  // ================================
  const addMessage = (msg) => {
  setMessages((prev) => {
    if (!prev || !prev.messages) return prev;

    // ❗ CASE 1: It's an ACK (Delivered/Seen)
    if (msg.messageId && !msg.content) {
      return {
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === msg.messageId
            ? { 
                ...m, 
                status: msg.status,
                readAt: msg.status === "SEEN" ? new Date().toISOString() : m.readAt
              }
            : m
        ),
      };
    }

    // ❗ CASE 2: It's a real message — prevent duplicates
    if (prev.messages.some(m => m.id === msg.id)) {
      return prev;
    }

    return {
      ...prev,
      messages: [...prev.messages, msg],
    };
  });
};


  // ================================
  // SEND MESSAGE (POST)
  // ================================
  const fetchSendMessagesById = async (conversationId, messageBody) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}conversation/${conversationId}/messages`,
        data: messageBody,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Add the sent message to state
      // addMessage(res);
      console.log(res)
      return res
    } catch (err) {
      setError(err);
      console.error("Error sending message: ", err);
    } finally {
      setLoading(false);
    }
  };
  

  const markMessagesAsRead = async (conversationId, messageIds = []) => {
  try {
    const token = sessionStorage.getItem("token");

    const body = {
      messageIds: messageIds,
      readAt: new Date().toISOString(),
    };

    await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/read`,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error("Read-status update failed", err);
  }
};

const acknowledgeDelivered = async (conversationId,messageId) => {
  try {
    const token = sessionStorage.getItem("token");

    await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/ack`,
      data: {
        messageId,
        status: "DELIVERED",
        deliveredAt: new Date().toISOString()
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error("Deliver-ACK failed", err);
  }
};

const syncDelivered = async () => {
  try {
    const token = sessionStorage.getItem("token");

    await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}conversation/messages/sync-delivered`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[SYNC-DELIVERED] Request sent successfully");
  } catch (err) {
    console.error("[SYNC-DELIVERED] failed", err);
  }
};


const sendMediaMessage = async (conversationId, file, caption,onUploadProgress,explicitType ) => {
    if (!file) return null;

    setLoading(true);
    setError(null);

    try {

      const clientMessageId = crypto.randomUUID();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientMessageId", clientMessageId);

      if (caption) {
        // 👇 adjust key name if your backend expects `caption` instead of `content`
        formData.append("caption", caption);
      }

      let type = explicitType;
      if (!type) {
        const mime = file.type || "";
        if (mime.startsWith("video/")) type = "VIDEO";
        else if (mime.startsWith("audio/")) type = "AUDIO";
        else type = "FILE"; // docs, images, etc.
      }
      formData.append("type", type);

      const res = await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/media`,
        data: formData,
        onUploadProgress: (event) => {
            if (!onUploadProgress || !event.total) return;
            const percent = Math.round((event.loaded * 100) / event.total);
            onUploadProgress(percent); // 👈 update progress in UI
          },
      });

      const data = res?.data || res;
      return data;
    } catch (err) {
      setError(err);
      console.error("Error sending media message:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };


  const deleteMessage = async (conversationId, messageId, scope = "ME") => {
  try {
    

    await fetchData({
      method: "DELETE",
      url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/${messageId}?scope=${scope}`,
    });

    console.log("Message delete successfully");
  } catch (err) {
    console.error("Message delete failed", err);
  }
};


const editMessage = async (conversationId, messageId, content) => {
  try {
    const token = sessionStorage.getItem("token");

    await fetchData({
      method: "PUT",
      url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/${messageId}`,
      data: { content },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Message edited successfully");
  } catch (err) {
    console.error("Message edit failed", err);
    throw err; // taaki upar handle kar sako
  }
};

const reactToMessage = async (conversationId, messageId, reaction) => {
  try {
    const token = sessionStorage.getItem("token");

    await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}conversation/${conversationId}/messages/react`,
      data: { messageId, reaction },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Message reaction sent");
  } catch (err) {
    console.error("Message reaction failed", err);
  }
};





  return {
    fetchMessagesById,
    messagess,
    addMessage,
    setMessages,
    fetchSendMessagesById,
    markMessagesAsRead,
    acknowledgeDelivered,
    syncDelivered,
    sendMediaMessage,
    deleteMessage,  
    editMessage,
    reactToMessage,
    loading,
    error,
  };
};
