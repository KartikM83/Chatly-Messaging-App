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
  const [contactList, setContactList] = useRecoilState(contactListAtom);
  const [conversationList, setConversationList] =useRecoilState(conversationListAtom);
   const [conversationById, setConversationById] =useRecoilState(conversationByIdAtom);
  const [error, setError] = useState(null);

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

      

      // store API data in Recoil
      setContactList(res);
   
    } catch (err) {
      setError(err);
      console.error("Error fetching contacts: ", err);
    } finally {
      setLoading(false);
    }
  };

  const getconversationList = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); 
      const userId = user?.id;


      const res = await fetchData({
        method: "Get",
        url: `${conf.apiBaseUrl}conversations?userId=${userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversationList(res);
      console.log(conversationList)
    } catch (err) {
      setError(err);
      console.error("Error fetching contacts: ", err);
    } finally {
      setLoading(false);
    }
  };


  const fetchConversationById = async (conversationId) => {

    setLoading(true)
    setError(null)

    try{

      const token = sessionStorage.getItem("token");

      const res = await fetchData({
        method:"Get",
        url: `${conf.apiBaseUrl}conversations/${conversationId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respose",res)

      setConversationById(res);
    }catch(err){
      setError(err);
      console.error("Error fetching contacts: ", err);
    }
    finally{
      setLoading(false);
    }



  }

  return {
    getContactList,
    contactList,
    getconversationList,
    conversationList,
    fetchConversationById,
    conversationById,
    loading,
    error,

  };
};

export default useContact;
