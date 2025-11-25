import { useParams } from "react-router-dom";
import ChatList from "../../../component/chat/ChatList";
import ChatWindow from "../../../component/chat/ChatWindow";
import { useEffect, useState } from "react";

export default function Chats() {
  const { conversationId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Listen for window resize → auto switch layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------------------------------
  // MOBILE LAYOUT
  // -------------------------------
  if (isMobile) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        {/* Only ChatList if no chat selected */}
        {!conversationId && (
          <div className="w-full">
            <ChatList />
          </div>
        )}

        {/* Only ChatWindow if chat selected */}
        {conversationId && (
          <div className="w-full">
            <ChatWindow />
          </div>
        )}
      </div>
    );
  }

  // -------------------------------
  // DESKTOP LAYOUT
  // -------------------------------
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-full md:w-[360px] border-r">
        <ChatList />
      </div>

      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
