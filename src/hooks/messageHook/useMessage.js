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

  // FETCH ALL MESSAGES
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

      setMessages(res); // Save full message list
    } catch (err) {
      setError(err);
      console.error("Error fetching Messages: ", err);
    } finally {
      setLoading(false);
    }
  };

  // ADD MESSAGE (Websocket incoming)
  const addMessage = (msg) => {
    setMessages((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), msg],
    }));
  };

  // SEND MESSAGE (POST)
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

      // IMPORTANT: Add sent message to chat
      addMessage(res);

    } catch (err) {
      setError(err);
      console.error("Error sending message: ", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchMessagesById,
    messagess,
    addMessage,
    fetchSendMessagesById,
    loading,
    error
  };
};







