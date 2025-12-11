import { useState } from "react";
import { useRecoilState } from "recoil";
import { conversationStateAtom } from "../../state/conversationState/ConversationState";
import useFetch from "../useFetch";
import conf from "../../config";

const useConversation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useRecoilState(conversationStateAtom);
  const [fetchData] = useFetch();

  // -------------------------------
  // DIRECT CONVERSATION
  // -------------------------------
  const createDirectConversation = async (participantId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}conversations`,
        data: {
          type: "DIRECT",
          participantId,
        },
      });

      setConversation(res);
      return res; // 👈 important so caller can navigate using res.id
    } catch (err) {
      setError(err);
      console.error("Error creating direct conversation: ", err);
      throw err; // optional but useful
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // GROUP CONVERSATION
  // -------------------------------
  /**
   * groupName: string
   * participantIds: string[]
   * groupProfileImageFile: File | null
   */
  const createGroupConversation = async (
    groupName,
    participantIds,
    groupProfileImageFile
  ) => {
    setLoading(true);
    setError(null);

    try {
      let res;

      // If we have an image: use multipart (POST /conversations multipart)
      if (groupProfileImageFile) {
        const formData = new FormData();

        const payload = {
          type: "GROUP",
          name: groupName,
          memberIds: participantIds,
        };

        formData.append("data", JSON.stringify(payload));
        formData.append("file", groupProfileImageFile);

        res = await fetchData({
          method: "POST",
          url: `${conf.apiBaseUrl}conversations`,
          data: formData,
          // if your useFetch needs a flag to avoid JSON.stringify:
          isFormData: true,
        });
      } else {
        // No image → pure JSON (POST /conversations JSON)
        res = await fetchData({
          method: "POST",
          url: `${conf.apiBaseUrl}conversations`,
          data: {
            type: "GROUP",
            name: groupName,
            memberIds: participantIds,
          },
        });
      }

      setConversation(res);
      return res; // 👈 so caller can navigate to `/chats/${res.id}`
    } catch (err) {
      setError(err);
      console.error("Error creating group conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archiveConversation = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({
        method:"POST",
        url: `${conf.apiBaseUrl}conversations/${conversationId}/archive`,
      });
      console.log("Archive conversation response: ", res);
      setConversation(res);
      return res;
    } catch (err) {
      setError(err);
      console.error("Error archiving conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }   
  };

   const unarchiveConversation = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({
        method:"POST",
        url: `${conf.apiBaseUrl}conversations/${conversationId}/unarchive`,
      });
      console.log("Unarchive conversation response: ", res);
      setConversation(res);
      return res;
    } catch (err) {
      setError(err);
      console.error("Error unarchiving conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }   
  };


  const pinnedConversation = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({
        method:"POST",
        url: `${conf.apiBaseUrl}conversations/${conversationId}/pinned`,
      });
      console.log("pinned conversation response: ", res);
      setConversation(res);
      return res;
    } catch (err) {
      setError(err);
      console.error("Error pinned conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }   
  };
  
    const unpinnedConversation = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({
        method:"POST",
        url: `${conf.apiBaseUrl}conversations/${conversationId}/unpinned`,
      });
      console.log("unpinned conversation response: ", res);
      setConversation(res);
      return res;
    } catch (err) {
      setError(err);
      console.error("Error unpinned conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }   
  };






  const deleteConversation = async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData({
        method:"POST",
        url: `${conf.apiBaseUrl}conversations/${conversationId}/delete`,
      });
      console.log("delete conversation response: ", res);
      setConversation(res);
      return res;
    } catch (err) {
      setError(err);
      console.error("Error delete conversation: ", err);
      throw err;
    } finally {
      setLoading(false);
    }   
  };

const leaveGroup = async (conversationId) => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}conversations/${conversationId}/leave`,
    });
    console.log("leave conversation response: ", res);

    // agar currently open conversation ye hi hai to null karo
    setConversation((prev) =>
      prev && prev.id === conversationId ? null : prev
    );

    return res; // string message / whatever
  } catch (err) {
    setError(err);
    console.error("Error leave conversation: ", err);
    throw err;
  } finally {
    setLoading(false);
  }
};






  return {
    loading,
    error,
    conversation,
    createDirectConversation,
    createGroupConversation,
    archiveConversation,
    setConversation,
    unarchiveConversation,
    deleteConversation,
    leaveGroup,
    pinnedConversation,
    unpinnedConversation   
  };
};

export default useConversation;
