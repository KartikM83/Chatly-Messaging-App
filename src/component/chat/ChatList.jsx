import { LuMessageSquarePlus } from "react-icons/lu";
import IconButton from "../uiComponent/IconButton";
import { use, useEffect, useRef, useState } from "react";
import SearchInput from "../uiComponent/SearchInput";
import { contacts } from "../../data/sampleData";
import Avatar from "../uiComponent/Avatar";
import useContact from "../../hooks/contactHook/useContact";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { RiUnpinLine } from "react-icons/ri";
import { BsPinAngle, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlinePhotoCamera } from "react-icons/md";
import useConversation from "../../hooks/conversationHook/useConversation";
import { HiUsers } from "react-icons/hi";
import { IoMdArrowBack } from "react-icons/io";

export default function ChatList() {
  const [openContactList, setOpenContactList] = useState(false);
  const [openbox, setOpenbox] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();



  // Crete Conversation

   // screens: "HOME" | "GROUP_SELECT" | "GROUP_DETAILS"
  const [newChatScreen, setNewChatScreen] = useState("HOME");

  // selected members for group
  const [selectedGroupContacts, setSelectedGroupContacts] = useState([]);

  // group details step
  const [groupName, setGroupName] = useState("");
  const [groupIconFile, setGroupIconFile] = useState(null);
  const [groupIconPreview, setGroupIconPreview] = useState(null);



  const {
    getContactList,
    contactList,
    loading,
    error,
    getConversationList,
    conversationList,
  } = useContact();


  const{
      loading : conversationLoading,
        error: conversationError,
        conversation,
createDirectConversation,
createGroupConversation 

  } = useConversation();



  useEffect(() => {
    getConversationList();
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

  const handleContactClick = (participantId) => {

    console.log("participantId",participantId); 
    createDirectConversation(participantId);
    setOpenContactList(false);
    navigate(`/chats/${conversation.id}`);
  };

  const toggleGroupMember = (contact) => {
  setSelectedGroupContacts((prev) => {
    const exists = prev.some((c) => c.userId === contact.userId);
    if (exists) {
      return prev.filter((c) => c.userId !== contact.userId);
    }
    return [...prev, contact];
  });

  setSearchContact(""); // clear search after selection like WhatsApp
};

const handleGroupIconChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setGroupIconFile(file);
  const url = URL.createObjectURL(file);
  setGroupIconPreview(url);
};


const handleCreateGroup = async () => {
  const participantIds = selectedGroupContacts.map((c) => c.userId);

  try {
    const newGroup = await createGroupConversation(
      groupName,
      participantIds,
      groupIconFile // File | null
    );

    setOpenContactList(false);
    setNewChatScreen("HOME");
    setSelectedGroupContacts([]);
    setGroupName("");
    setGroupIconFile(null);

    navigate(`/chats/${newGroup.id}`);
  } catch (e) {
    console.error(e);
  }
};


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
  setOpenContactList(true);
  setNewChatScreen("HOME");
  setSelectedGroupContacts([]);
  setGroupName("");
  setGroupIconFile(null);
  setGroupIconPreview(null);
  setOpenbox(false);
}}

            />
            


            {openContactList && (
  <div
    ref={contactListRef}
    className="absolute z-[1000] top-[109px] left-[370px] rounded-[8px] w-[330px] h-[500px] bg-card shadow-lg overflow-hidden"
  >
    <div className="relative w-full h-full">

      {/* ======================
          SCREEN 1: NEW CHAT
          ====================== */}
      <div
        className={`absolute inset-0 flex flex-col transition-transform duration-200
        ${newChatScreen === "HOME" ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col gap-2 px-4 py-4 border-b">
          <span className="text-xl font-heading font-bold">New chat</span>
          <SearchInput
            value={searchContact}
            onChange={setSearchContact}
            placeholder="Search name or number"
          />
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {/* New group row */}
          <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer">
            <div
              className="flex items-center gap-3"
              onClick={() => {
                setNewChatScreen("GROUP_SELECT");
                setSelectedGroupContacts([]);
                setSearchContact("");
              }}
            >
              <Avatar src={null} alt="Group" size="md">
                <HiUsers />
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">New group</h3>
              </div>
            </div>
          </div>

          <div className="px-3 text-sm font-heading font-bold">Contacts</div>

          {filteredMatches.map((contact) => (
            <div
              key={contact.userId}
              className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleContactClick(contact.userId)}
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
            >
              <div className="flex items-center gap-3">
                <Avatar src={null} alt={contact.name} size="md">
                  <FaUserAlt />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.bio}
                  </p>
                </div>
                <span className="text-primary font-bold">invite</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================
          SCREEN 2: SELECT MEMBERS
          ====================== */}
      {newChatScreen === "GROUP_SELECT" && (
        <div className="absolute inset-0 flex flex-col bg-card animate-[slideIn_0.2s_ease-out]">
          <div className="flex flex-col gap-2 px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <IconButton
                icon={IoMdArrowBack}
                variant="ghost"
                ariaLabel="Back"
                onClick={() => setNewChatScreen("HOME")}
              />
              <span className="text-xl font-heading font-bold">
                New group {selectedGroupContacts.length > 0 && ` ${selectedGroupContacts.length}`}
              </span>
            </div>

            {/* chips + search in one box (like WhatsApp) */}
            <div className="flex items-center gap-2 flex-wrap bg-muted rounded-lg px-2 py-1 min-h-[40px]">
              {selectedGroupContacts.map((c) => (
                <div
                  key={c.userId}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs"
                >
                  <span className="max-w-[90px] truncate">{c.name}</span>
                  <button
                    onClick={() => toggleGroupMember(c)}
                    className="text-[10px] leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm py-1 min-w-[80px]"
                placeholder={selectedGroupContacts.length === 0 ? "Search" : ""}
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            <div className="px-3 text-sm font-heading font-bold">
              All contacts
            </div>

            {filteredMatches.map((contact) => {
              const isSelected = selectedGroupContacts.some(
                (c) => c.userId === contact.userId
              );
              return (
                <div
                  key={contact.userId}
                  className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleGroupMember(contact)}
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
                    <div
                      className={`w-5 h-5 rounded-sm border flex items-center justify-center
                      ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
                    >
                      {isSelected && (
                        <span className="text-[12px] text-card">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t flex gap-2">
            <button
              className="flex-1 h-9 rounded-md bg-primary text-card text-sm font-medium disabled:opacity-50"
              disabled={selectedGroupContacts.length === 0}
              onClick={() => setNewChatScreen("GROUP_DETAILS")}
            >
              Next
            </button>
            <button
              className="flex-1 h-9 rounded-md border text-sm font-medium"
              onClick={() => {
                setOpenContactList(false);
                setNewChatScreen("HOME");
                setSelectedGroupContacts([]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ======================
          SCREEN 3: GROUP DETAILS (your screenshot)
          ====================== */}
      {newChatScreen === "GROUP_DETAILS" && (
        <div className="absolute inset-0 flex flex-col bg-card animate-[slideIn_0.2s_ease-out]">
          <div className="flex flex-col gap-3 px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <IconButton
                icon={IoMdArrowBack}
                variant="ghost"
                ariaLabel="Back"
                onClick={() => setNewChatScreen("GROUP_SELECT")}
              />
              <span className="text-xl font-heading font-bold">
                New group {selectedGroupContacts.length > 0 && ` ${selectedGroupContacts.length}`}
              </span>
            </div>

            {/* Selected chips box (like your screenshot) */}
            <div className="flex flex-wrap gap-2 bg-muted rounded-lg px-2 py-2 min-h-[44px]">
              {selectedGroupContacts.map((c) => (
                <div
                  key={c.userId}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs"
                >
                  <span className="max-w-[120px] truncate">{c.name}</span>
                  <button
                    onClick={() => toggleGroupMember(c)}
                    className="text-[10px] leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {/* Group icon */}
            <div className="flex items-center gap-3">
              <label className="w-12 h-12 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden">
                {groupIconPreview ? (
                  <img
                    src={groupIconPreview}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Add icon
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGroupIconChange}
                />
              </label>
              <div className="text-xs text-muted-foreground">
                Add group icon <span className="opacity-70">(optional)</span>
              </div>
            </div>

            {/* Group name */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Provide a group name
              </span>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Group name (optional)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-4 py-3 border-t flex gap-2">
            <button
              className="flex-1 h-9 rounded-md bg-primary text-card text-sm font-medium disabled:opacity-50"
              disabled={selectedGroupContacts.length === 0}
              onClick={handleCreateGroup}
            >
              Create
            </button>
            <button
              className="flex-1 h-9 rounded-md border text-sm font-medium"
              onClick={() => {
                setOpenContactList(false);
                setNewChatScreen("HOME");
                setSelectedGroupContacts([]);
                setGroupName("");
                setGroupIconFile(null);
                setGroupIconPreview(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
