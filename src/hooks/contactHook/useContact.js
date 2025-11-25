import { useState } from "react";
import useFetch from "../useFetch";
import { useRecoilState } from "recoil";
import {
  contactListAtom,
  conversationByIdAtom,
  conversationListAtom,
} from "../../state/contactState/ContactState";
import conf from "../../config";

const useContact = () => {
  const [fetchData] = useFetch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [contactList, setContactList] = useRecoilState(contactListAtom);
  const [conversationList, setConversationList] =
    useRecoilState(conversationListAtom);
  const [conversationById, setConversationById] =
    useRecoilState(conversationByIdAtom);

  // -----------------------------
  // Fetch Contact List
  // -----------------------------
  const getContactList = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetchData({
        method: "GET",
        url: `${conf.apiBaseUrl}users/sync-contacts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContactList(res);
    } catch (err) {
      setError(err);
      console.error("Error fetching contacts: ", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch Conversation List
  // -----------------------------
  const getConversationList = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      const res = await fetchData({
        method: "GET",
        url: `${conf.apiBaseUrl}conversations?userId=${userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversationList(res);
      console.log("Conversation List:", res);
    } catch (err) {
      setError(err);
      console.error("Error fetching conversation list: ", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch Conversation By ID
  // -----------------------------
  const fetchConversationById = async (conversationId) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetchData({
        method: "GET",
        url: `${conf.apiBaseUrl}conversations/${conversationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", res);
      setConversationById(res);
    } catch (err) {
      setError(err);
      console.error("Error fetching conversation by ID: ", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Return API
  // -----------------------------
  return {
    getContactList,
    contactList,
    getConversationList,
    conversationList,
    fetchConversationById,
    conversationById,
    setConversationById,
    setConversationList,
    loading,
    error,
  };
};

export default useContact;
