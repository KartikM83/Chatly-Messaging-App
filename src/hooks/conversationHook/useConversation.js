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

  return {
    loading,
    error,
    conversation,
    createDirectConversation,
    createGroupConversation,
  };
};

export default useConversation;
