import { LuArchive, LuMessageSquarePlus, LuPin, LuVideo } from "react-icons/lu";
import IconButton from "../uiComponent/IconButton";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../uiComponent/SearchInput";

import Avatar from "../uiComponent/Avatar";
import useContact from "../../hooks/contactHook/useContact";
import { FaFileAlt, FaUser, FaUserAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { RiDeleteBin6Line, RiUnpinLine } from "react-icons/ri";
import { BsPinAngle, BsThreeDotsVertical } from "react-icons/bs";
import { MdInsertPhoto, MdOutlinePhotoCamera } from "react-icons/md";
import useConversation from "../../hooks/conversationHook/useConversation";
import { HiUsers } from "react-icons/hi";
import { IoMdArrowBack } from "react-icons/io";
import { FiCamera } from "react-icons/fi";
import { FaHeadphones } from "react-icons/fa6";

export default function ChatList() {
  const [openContactList, setOpenContactList] = useState(false);
  const [openbox, setOpenbox] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupIconMenu, setShowGroupIconMenu] = useState(false);

  const groupIconInputRef = useRef(null);
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
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");

  const {
    getContactList,
    contactList,
    getConversationList,
    conversationList,
    setConversationList,
    addContact,
  } = useContact();

  const {
    createDirectConversation,
    createGroupConversation,
    archiveConversation,
    deleteConversation,
    leaveGroup,
    pinnedConversation,
    unpinnedConversation,
  } = useConversation();

  useEffect(() => {
    getConversationList();
  }, []);

  const { conversationId: activeConversationId } = useParams();
  // CURRENT USER
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?.id;

  const filterByNameOrNumber = (list = []) => {
    if (!Array.isArray(list)) return [];

    const query = searchContact.toLowerCase();

    return list.filter((contact) => {
      const nameMatch = contact.name?.toLowerCase().includes(query);
      const numberMatch = contact.phoneNumber?.includes(query);
      return nameMatch || numberMatch;
    });
  };

  console.log("conversation", conversationList);

  const filteredMatches = filterByNameOrNumber(contactList?.matches || []);
  const filteredUnmatches = filterByNameOrNumber(contactList?.unmatches || []);

  console.log("matches", contactList?.matches);

  // ✅ Context menu state (Desktop)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    conversationId: null,
  });

  const contactListRef = useRef(null);
  const longPressTimer = useRef(null);
  const boxRef = useRef(null);

  // ✅ Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && !event.target.closest(".context-menu")) {
        setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // ✅ Right click (Desktop)
  const handleRightClick = (e, conversationId) => {
    console.log("Right click detected on conversation:", conversationId);
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      conversationId,
    });
  };

  // ✅ Long press (Mobile)
  const handleTouchStart = (conversationId) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedConversationId(conversationId);
      setContextMenu({ visible: false, x: 0, y: 0, conversationId });
      // don't show floating menu on mobile
    }, 600);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // ✅ Context Menu / Header Action Handler
  const handleMenuAction = async (action) => {
    const targetId = contextMenu.conversationId || selectedConversationId;
    const targetConversation = conversationList?.find((c) => c.id === targetId);

    if (!targetId) return;

    try {
      switch (action) {
        case "archive": {
          const res = await archiveConversation(targetId);
          console.log("Archive action response: ", res);
          await getConversationList();
          break;
        }
        case "pin": {
          const isPinned =
            targetConversation?.pinned || targetConversation?.isPinned;

          if (isPinned) {
            await unpinnedConversation(targetId);
          } else {
            await pinnedConversation(targetId);
          }

          await getConversationList();
          break;
        }

        case "delete":
          await deleteConversation(targetId);
          await getConversationList();
          navigate(`/chats`);
          break;
        case "leave":
          await leaveGroup(targetId);
          await getConversationList();
          navigate(`/chats`);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Action failed:", action, err);
    }

    setContextMenu({ visible: false, conversationId: null });
    setSelectedConversationId(null);
  };

  const conversationFilter = (conversationList || [])
    .filter((conversation) => !conversation.archived)
    .filter((conversation) => {
      const query = searchQuery.toLowerCase();

      // -------------------------------
      // DIRECT CHAT SEARCH
      // -------------------------------
      if (conversation.type === "DIRECT") {
        const otherUser = (conversation.participants || []).find(
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
    })
    .sort((a, b) => {
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;

      if (aPinned !== bPinned) return bPinned - aPinned; // pinned first

      // fallback to latest message time
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

  const handleContactClick = async (participantId) => {
    try {
      console.log("participantId", participantId);

      // ✅ 1) Create (or get existing) conversation from backend
      const newConversation = await createDirectConversation(participantId);

      // ✅ 2) Merge into global conversation list (no duplicates, move to top)
      setConversationList((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) {
          return [newConversation];
        }

        // remove if already exists (DIRECT that backend re-used)
        const without = prev.filter((c) => c && c.id !== newConversation.id);

        // put it on top
        return [newConversation, ...without];
      });

      // ✅ 3) Close popup
      setOpenContactList(false);

      // ✅ 4) Navigate using the newly created conversation's ID
      navigate(`/chats/${newConversation.id}`);
    } catch (e) {
      console.error("Failed to create/open direct conversation", e);
    }
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

  const openGroupIconPicker = () => {
    if (groupIconInputRef.current) {
      groupIconInputRef.current.click();
    }
  };

  const handleGroupIconClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If no icon yet → just open file picker
    if (!groupIconPreview) {
      openGroupIconPicker();
      return;
    }

    // If icon exists → show menu
    setShowGroupIconMenu((prev) => !prev);
  };

  const handleGroupIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean previous preview url if any
    if (groupIconPreview) {
      URL.revokeObjectURL(groupIconPreview);
    }

    setGroupIconFile(file);
    const url = URL.createObjectURL(file);
    setGroupIconPreview(url);
    setShowGroupIconMenu(false);
  };

  const handleRemoveGroupIcon = () => {
    if (groupIconPreview) {
      URL.revokeObjectURL(groupIconPreview);
    }
    setGroupIconFile(null);
    setGroupIconPreview(null);
    setShowGroupIconMenu(false);

    // also clear input value so same file can be selected again if needed
    if (groupIconInputRef.current) {
      groupIconInputRef.current.value = "";
    }
  };

  const handleAddContact = async () => {
    try {
      await addContact(newContactPhone.trim(), newContactName.trim());
      setNewContactPhone("");
      setNewContactName("");
      setNewChatScreen("HOME");
      getContactList();
    } catch (err) {
      console.error("Failed to add contact", err);
    }
  };

  const handleCreateGroup = async () => {
    const participantIds = selectedGroupContacts.map((c) => c.userId);

    try {
      const newGroup = await createGroupConversation(
        groupName,
        participantIds,
        groupIconFile // File | null
      );

      // ✅ 1) Update global conversation list (no duplicates, move to top)
      setConversationList((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) {
          return [newGroup];
        }

        const without = prev.filter((c) => c && c.id !== newGroup.id);

        return [newGroup, ...without];
      });

      // ✅ 2) Reset popup state
      setOpenContactList(false);
      setNewChatScreen("HOME");
      setSelectedGroupContacts([]);
      setGroupName("");
      setGroupIconFile(null);
      setGroupIconPreview(null);

      // ✅ 3) Navigate to that group chat
      navigate(`/chats/${newGroup.id}`);
    } catch (e) {
      console.error("Failed to create group", e);
    }
  };

  // safe: handle null/undefined
  const contextConversation = (conversationList || []).find(
    (c) => c.id === contextMenu.conversationId
  );

  return (
    <div className="w-full flex flex-col h-full bg-card overflow-hidden">
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
                setNewChatScreen("HOME");
                setSelectedGroupContacts([]);
                setGroupName("");
                setGroupIconFile(null);
                setGroupIconPreview(null);
                setOpenbox(false);
              }}
            />
          </div>

          {/* ✅ Mobile Header Actions */}

          <div className="md:hidden flex items-center gap-2 ">
            {selectedConversationId ? (
              <>
                <button onClick={() => handleMenuAction("pin")}>
                  {(conversationList || []).find(
                    (c) => c.id === selectedConversationId
                  )?.isPinned ? (
                    <IconButton
                      icon={RiUnpinLine}
                      variant="normal"
                      ariaLabel="Unpin Chat"
                      size="md"
                    />
                  ) : (
                    <IconButton
                      icon={BsPinAngle}
                      variant="normal"
                      ariaLabel="Pin Chat"
                      size="md"
                    />
                  )}
                </button>

                <button onClick={() => handleMenuAction("archive")}>
                  <IconButton
                    icon={LuArchive}
                    variant="normal"
                    ariaLabel="Archive Chat"
                    size="md"
                  />
                </button>

                <button onClick={() => handleMenuAction("delete")}>
                  <IconButton
                    icon={RiDeleteBin6Line}
                    variant="normal"
                    ariaLabel="Delete Chat"
                    size="md"
                  />
                </button>

                <button
                  onClick={() => {
                    selectedConversationId(null);
                    setContextMenu({ visible: false, conversationId: null });
                  }}
                >
                  <IconButton
                    icon={BsThreeDotsVertical}
                    variant="normal"
                    ariaLabel="Cancel Selection"
                    size="md"
                  />
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
              onClick={() => navigate("/settings")}
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
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const currentUserId = storedUser?.id;

            const formatLastMessage = () => {
              const text = conversation.lastMessage || "";
              const type = (conversation.lastMessageType || "").toUpperCase();

              const getFileName = (url) => {
                try {
                  const clean = url.split("?")[0]; // remove query params
                  const full = decodeURIComponent(clean.split("/").pop() || "");

                  // If filename contains PREFIX_UUID_original-name
                  // Example → 1765120509672_94a5d8f4_ChatlyAPI.pdf
                  const parts = full.split("_");

                  // The REAL name is everything after the 2 prefixes
                  // (timestamp + uuid)
                  if (parts.length >= 3) {
                    return parts.slice(2).join("_"); // → "ChatlyAPI.pdf"
                  }

                  return full; // fallback
                } catch {
                  return "file";
                }
              };

              if (type === "TEXT") return text;

              if (type === "IMAGE" || /\.(jpg|jpeg|png|gif|webp)$/i.test(text))
                return (
                  <span className="flex items-center gap-1">
                    <MdInsertPhoto size={15} /> Photo
                  </span>
                );

              if (type === "VIDEO")
                return (
                  <span className="flex items-center gap-1">
                    <LuVideo size={15} /> Video
                  </span>
                );
              if (type === "AUDIO")
                return (
                  <span className="flex items-center gap-1">
                    <FaHeadphones size={15} /> Audio
                  </span>
                );

              if (type === "FILE" || type === "DOCUMENT")
                return (
                  <span className="flex items-center gap-1">
                    <FaFileAlt size={15} />{" "}
                    {getFileName(conversation.lastMessage)}
                  </span>
                );

              // fallback if unknown
              return "";
            };

            let displayName = "";
            let displayImage = "";

            // ----------------------------
            //   CASE 1: DIRECT CHAT
            // ----------------------------
            if (conversation.type === "DIRECT") {
              const otherUser = (conversation.participants || []).find(
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
                onContextMenu={(e) => handleRightClick(e, conversation.id)} // 🖱 Desktop
                onTouchStart={() => handleTouchStart(conversation.id)} // 📱 Mobile long press
                onTouchEnd={handleTouchEnd}
              >
                <Avatar src={displayImage} alt={displayName} size="lg" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate flex items-center gap-1.5">
                      {displayName}
                      {conversation.pinned && (
                        <LuPin className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {/* {chat.archived && (
              <div className="bg-primary text-white text-[10px] px-1 rounded-[2px]">
                archived
              </div>
            )} */}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.lastMessageAt
                        ? new Date(
                            conversation.lastMessageAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center ">
                    <p className="flex-1 w-40 text-sm text-muted-foreground truncate">
                      {formatLastMessage()}
                    </p>
                    {conversation.unreadCount === 0 ? (
                      ""
                    ) : (
                      <div className="bg-primary font-heading text-white text-[11px] px-2 py-0.5 flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Conversation start button - Mobile */}

      <div className="absolute bottom-28 right-4 md:hidden">
        <IconButton
          icon={LuMessageSquarePlus}
          variant="primary"
          ariaLabel="New Chat"
          size="xl"
          onClick={(e) => {
            e.stopPropagation();
            getContactList();
            setOpenContactList((prev) => !prev);
            setNewChatScreen("HOME");
            setSelectedGroupContacts([]);
            setGroupName("");
            setGroupIconFile(null);
            setGroupIconPreview(null);
            setOpenbox(false);
          }}
        />
      </div>

      {openContactList && (
        <div
          className="
      fixed inset-0 z-[1000]
      flex justify-center items-end md:items-start
      bg-black/40 md:bg-transparent
    
    "
          onClick={() => {
            setOpenContactList(false);
          }}
        >
          <div
            ref={contactListRef}
            className="
        w-full h-[100%] bg-card shadow-lg overflow-hidden
        md:rounded-[8px] md:w-[330px] md:h-[500px]
        md:absolute md:top-[109px] md:left-[370px]
           pointer-events-auto
   
      "
            onClick={(e) => e.stopPropagation()}
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
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={IoMdArrowBack}
                      variant="ghost"
                      onClick={() => setOpenContactList(false)}
                      ariaLabel="Back"
                      className="md:hidden"
                    />
                    <span className="text-xl font-heading font-bold">
                      New chat
                    </span>
                  </div>

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
                      <Avatar src={<HiUsers />} alt="Group" size="md" />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">New group</h3>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer">
                    <div
                      className="flex items-center gap-3"
                      onClick={() => {
                        setNewChatScreen("NEW_CONTACT");
                        // setSelectedGroupContacts([]);
                        // setSearchContact("");
                      }}
                    >
                      <Avatar src={<FaUser />} alt="New Contact" size="md" />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">New contact</h3>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 text-sm font-heading font-bold">
                    Contacts
                  </div>

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
                        New group{" "}
                        {selectedGroupContacts.length > 0 &&
                          ` ${selectedGroupContacts.length}`}
                      </span>
                    </div>

                    {/* chips + search in one box (like WhatsApp) */}
                    <div className="flex items-center gap-2 flex-wrap bg-muted rounded-lg px-2 py-1 min-h-[40px]">
                      {selectedGroupContacts.map((c) => (
                        <div
                          key={c.userId}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs"
                        >
                          <span className="max-w-[90px] truncate">
                            {c.name}
                          </span>
                        </div>
                      ))}

                      <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-sm py-1 min-w-[80px]"
                        placeholder={
                          selectedGroupContacts.length === 0 ? "Search" : ""
                        }
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
                      ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      }`}
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
                  <div className="flex flex-col gap-2 px-4 py-4 border-b ">
                    <div className="flex items-center gap-2">
                      <IconButton
                        icon={IoMdArrowBack}
                        variant="ghost"
                        ariaLabel="Back"
                        onClick={() => setNewChatScreen("GROUP_SELECT")}
                      />
                      <span className="text-xl font-heading font-bold">
                        New group{" "}
                        {selectedGroupContacts.length > 0 &&
                          ` ${selectedGroupContacts.length}`}
                      </span>
                    </div>

                    {/* Selected chips box (like your screenshot) */}
                    <div className="flex items-center gap-2 flex-wrap bg-muted rounded-lg px-2 py-1 min-h-[40px]">
                      {selectedGroupContacts.map((c) => (
                        <div
                          key={c.userId}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs"
                        >
                          <span className="max-w-[90px] truncate">
                            {c.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                    {/* Group icon */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {/* Clickable avatar */}
                        <button
                          type="button"
                          onClick={handleGroupIconClick}
                          className="w-12 h-12 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
                        >
                          {groupIconPreview ? (
                            <img
                              src={groupIconPreview}
                              alt="Group"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiCamera className="w-5 h-5 opacity-70" />
                          )}
                        </button>

                        {/* Hidden file input */}
                        <input
                          ref={groupIconInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleGroupIconChange}
                        />

                        {/* Popup menu when icon already exists */}
                        {showGroupIconMenu && groupIconPreview && (
                          <div className="absolute top-14 left-0 z-50 w-40 bg-card border rounded-lg shadow-lg py-1 text-sm">
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted/60"
                              onClick={() => {
                                setShowGroupIconMenu(false);
                                openGroupIconPicker();
                              }}
                            >
                              Change photo
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-destructive hover:bg-muted/60"
                              onClick={handleRemoveGroupIcon}
                            >
                              Remove photo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Add group icon{" "}
                        <span className="opacity-70">(optional)</span>
                      </div>
                    </div>

                    {/* Group name */}
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Provide a group name
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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

              {newChatScreen === "NEW_CONTACT" && (
                <div className="absolute inset-0 flex flex-col bg-card animate-[slideIn_0.2s_ease-out]">
                  <div className="flex flex-col gap-2 px-4 py-4 border-b ">
                    <div className="flex items-center gap-2">
                      <IconButton
                        icon={IoMdArrowBack}
                        variant="ghost"
                        ariaLabel="Back"
                        onClick={() => setNewChatScreen("HOME")}
                      />
                      <span className="text-xl font-heading font-bold">
                        New contact{" "}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="w-full flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center gap-4">
                    <Avatar src={<FaUser />} alt="New Contact" size="xl" />
                    {/* Group icon */}

                    {/* Group name */}
                    <div className="w-full flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Phone Number
                      </span>
                      <input
                        type="text"
                        inputMode="tel"
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Phone Number"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Name
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="px-4 py-3 border-t flex gap-2">
                    <button
                      className="flex-1 h-9 rounded-md bg-primary text-card text-sm font-medium disabled:opacity-50"
                      onClick={handleAddContact}
                    >
                      Add
                    </button>
                    <button
                      className="flex-1 h-9 rounded-md border text-sm font-medium"
                      onClick={() => {
                        setOpenContactList(false);
                        setNewChatScreen("HOME");
                        setNewContactPhone("");
                        setNewContactName("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Desktop Context Menu */}
      {contextMenu.visible && (
        <div
          className="hidden md:block context-menu absolute bg-white rounded-xl shadow-lg border w-44 py-2"
          style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 9 }}
        >
          {/* PIN / UNPIN (common for both) */}
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("pin")}
          >
            {contextConversation?.pinned ? (
              <div className="flex items-center gap-1">
                <RiUnpinLine className="w-5 h-5" /> Unpin Chat
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <BsPinAngle className="w-5 h-5" /> Pin Chat
              </div>
            )}
          </button>

          {/* ARCHIVE (common for both) */}
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("archive")}
          >
            <div className="flex items-center gap-1">
              <LuArchive className="w-5 h-5" /> Archive Chat
            </div>
          </button>

          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            onClick={() => handleMenuAction("delete")}
          >
            <div className="flex items-center gap-1">
              <RiDeleteBin6Line className="w-5 h-5" /> Delete Chat
            </div>
          </button>

          {/* 🚪 EXIT GROUP → sirf GROUP ke liye */}
          {contextConversation?.type === "GROUP" && (
            <button
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              onClick={() => handleMenuAction("leave")}
            >
              <div className="flex items-center gap-1">
                <RiDeleteBin6Line className="w-5 h-5" /> Exit Group
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
