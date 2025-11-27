import {  useState } from "react";
import { useRecoilState } from "recoil";
import { conversationStateAtom } from "../../state/conversationState/ConversationState";
import useFetch from "../useFetch";
import conf from "../../config";

const useConversation = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversation, setConversation] = useRecoilState(conversationStateAtom);
    const [fetchData] = useFetch();


    const crateConversation = async (participantId) => {
        setLoading(true);
        setError(null);

        try{

            const res = await fetchData({
                method: "POST",
                url: `${conf.apiBaseUrl}conversations`,
                data:{
                    type: "DIRECT",
                    participantId: participantId  
                }
            });
            setConversation(res);
        }catch(err){
            setError(err);
            console.error("Error creating conversation: ", err);
        }finally{
            setLoading(false);

        
        }

    }

    return {
        loading,
        error,
        conversation,
        crateConversation
    }   


}

export default useConversation;