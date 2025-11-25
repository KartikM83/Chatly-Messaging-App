import { LuMessageSquarePlus } from "react-icons/lu";
import IconButton from "../uiComponent/IconButton";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../uiComponent/SearchInput";
import { contacts } from "../../data/sampleData";
import Avatar from "../uiComponent/Avatar";
import useContact from "../../hooks/contactHook/useContact";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { RiUnpinLine } from "react-icons/ri";
import { BsPinAngle, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlinePhotoCamera } from "react-icons/md";

export default function ChatList() {
  const [openContactList, setOpenContactList] = useState(false);
  const [openbox, setOpenbox] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const {
    getContactList,
    contactList,
    loading,
    error,
    getconversationList,
    conversationList,
  } = useContact();

  useEffect(() => {
    getconversationList();
  }, []);

  const { conversationId: activeConversationId } = useParams();

  const filterByNameOrNumber = (list = []) => {
  if (!Array.isArray(list)) return [];

  const query = searchContact.toLowerCase();

  return list.filter((contact) => {
    const nameMatch = contact.name?.toLowerCase().includes(query);
    const numberMatch = contact.phoneNumber?.includes(query);
    return nameMatch || numberMatch;
  });
};


console.log("conversation",conversationList)

  const filteredMatches = filterByNameOrNumber(contactList?.matches || "");
  const filteredUnmatches = filterByNameOrNumber(contactList?.unmatches || "");

  console.log("matches", contactList?.matches);

  const contactListRef = useRef(null);
  const longPressTimer = useRef(null);
  const boxRef = useRef(null);

  const conversationFilter = (conversationList || []).filter((conversation) => {
    const query = searchQuery.toLowerCase();

    // CURRENT USER
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = storedUser?.id;

    // -------------------------------
    // DIRECT CHAT SEARCH
    // -------------------------------
    if (conversation.type === "DIRECT") {
      const otherUser = conversation.participants?.find(
        (p) => p.id !== currentUserId
      );
      const name = otherUser?.name?.toLowerCase() || "";
      const number = otherUser?.phoneNumber || "";

      return name.includes(query) || number.includes(query);
    }

    // -------------------------------
    // GROUP CHAT SEARCH
    // -------------------------------
    if (conversation.type === "GROUP") {
      const group = conversation.groupName?.toLowerCase() || "";
      return group.includes(query);
    }

    return false;
  });

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-2 border-b ">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold">
            <span className="hidden md:inline">Chats</span>
            <span className="inline md:hidden">Chatly</span>
          </h1>

          <div className="hidden md:block">
            <IconButton
              icon={LuMessageSquarePlus}
              variant="primary"
              ariaLabel="New Chat"
              size="md"
              onClick={(e) => {
                e.stopPropagation();
                getContactList();
                setOpenContactList((prev) => !prev);
                setOpenbox(false);
              }}
            />
            {openContactList && (
              <div
                ref={contactListRef}
                className="absolute z-[1000] top-[109px] left-[370px] rounded-[8px] w-[330px] h-[500px] bg-card flex flex-col gap-2 shadow-lg"
              >
                <div className="flex flex-col gap-2 px-4 py-4 border-b">
                  <span className="text-xl font-heading font-bold">
                    New chat
                  </span>
                  <SearchInput
                    value={searchContact}
                    onChange={setSearchContact}
                    placeholder="Search name or number"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pb-20">
                  {filteredMatches.map((contact) => (
                    <div
                      key={contact.userId}
                      className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={contact.profileImage}
                          alt={contact.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUnmatches.map((contact) => (
                    <div
                      key={contact.phoneNumber}
                      className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                      // onClick={() => handleContactClick(contact.id)}
                    >
                      <div className="flex items-center gap-3 ">
                        <Avatar
                          src={<FaUserAlt />}
                          alt={contact.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0 ">
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.bio}
                          </p>
                        </div>
                        <div>
                          <span className="text-primary font-bold">invite</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Mobile Header Actions */}

        <div className="md:hidden flex items-center gap-2">
           <IconButton
                  icon={MdOutlinePhotoCamera}
                  variant="normal"
                  ariaLabel="Open Camera"
                  size="md"
                />
                    <IconButton
                  icon={BsThreeDotsVertical}
                  variant="normal"
                  ariaLabel="More Options"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenbox((prev) => !prev);
                    setOpenContactList(false);
                  }}
                />
        </div>
        </div>


        {/* 3-dot Dropdown */}
        {openbox && (
          <div
            ref={boxRef}
            className="absolute z-[1000] top-12 right-1 rounded-xl w-48 bg-card py-4 flex flex-col gap-2 shadow-[0_0_12px_rgba(0,0,0,0.2)]"
          >
            <span
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => console.log("Starred clicked")}
            >
              Starred
            </span>
            <span
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => navigate(`/settings`)}
            >
              {" "}
              Settings{" "}
            </span>{" "}
          </div>
        )}

        
        



        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search or start a new chat"
        />
      </div>
      <div className="flex-1 overflow-y-auto ">
        {conversationFilter.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-6">
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Select a contact to start a conversation</p>
          </div>
        ) : (
          conversationFilter.map((conversation) => {
            if (!conversation) return null;

            // Get current logged in user
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const currentUserId = storedUser?.id;

            let displayName = "";
            let displayImage = "";

            // ----------------------------
            //   CASE 1: DIRECT CHAT
            // ----------------------------
            if (conversation.type === "DIRECT") {
              const otherUser = conversation.participants.find(
                (p) => p.id !== currentUserId
              );

              displayName = otherUser?.name;
              displayImage = otherUser?.profileImage;
            }

            // ----------------------------
            //   CASE 2: GROUP CHAT
            // ----------------------------
            if (conversation.type === "GROUP") {
              displayName = conversation.groupName; // GROUP NAME

              // Use the group admin OR first participant as image
              displayImage = conversation?.groupProfileImage;

              {
                console.log("displayImage", displayImage);
              }
            }

            const isActive = activeConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                onClick={() => navigate(`/chats/${conversation.id}`)}
                className={`flex items-center gap-3 px-4 py-3  cursor-pointer ${
                  isActive ? "bg-muted/60" : "hover:bg-muted/50"
                }`}
              >
                <Avatar src={displayImage} alt={displayName} size="md" />

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate flex items-center gap-1.5">
            {displayName}
            {/* {chat.isPinned && (
              <LuPin className="w-3.5 h-3.5 text-muted-foreground" />
            )} */}
            {/* {chat.archived && (
              <div className="bg-primary text-white text-[10px] px-1 rounded-[2px]">
                archived
              </div>
            )} */}
          </h3>
          <span className="text-xs text-muted-foreground">
            {new Date(conversation.lastMessageAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage
                      ? conversation.lastMessage
                      : "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
