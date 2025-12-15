// src/features/chat/ChatList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuMessageSquarePlus } from "react-icons/lu";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";

import useContact from "../../hooks/contactHook/useContact";
import useConversation from "../../hooks/conversationHook/useConversation";
import ChatHeader from "./ChatHeader";
import ConversationList from "./ConversationList";
import FloatingNewChatButton from "./FloatingNewChatButton";
import NewChatPopup from "./NewChatPopup.jsx";
import ContextMenu from "./ContextMenu";

/**
 * Main container. Keeps the application state and passes UI props down.
 * Most API interactions remain here (createDirectConversation, getConversationList, etc.)
 */
export default function ChatList() {
  const groupIconInputRef = useRef(null);
  const contactListRef = useRef(null);
  const longPressTimer = useRef(null);

  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();

  // UI state
  const [openContactList, setOpenContactList] = useState(false);
  const [openbox, setOpenbox] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupIconMenu, setShowGroupIconMenu] = useState(false);
  const [newChatScreen, setNewChatScreen] = useState("HOME");

  // group creation state
  const [selectedGroupContacts, setSelectedGroupContacts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupIconFile, setGroupIconFile] = useState(null);
  const [groupIconPreview, setGroupIconPreview] = useState(null);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");

  // load current stored user
  const [storedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const currentUserId = storedUser?.id;

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    conversationId: null,
  });

  // hooks (unchanged from your original)
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

  

  // initial fetch
  useEffect(() => {
    getConversationList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered contacts (matches/unmatches) memoized
  const filteredMatches = useMemo(() => {
    const q = (searchContact || "").toLowerCase();
    return (contactList?.matches || []).filter((contact) => {
      return (
        (contact.name || "").toLowerCase().includes(q) ||
        (contact.phoneNumber || "").includes(q)
      );
    });
  }, [contactList, searchContact]);

  const filteredUnmatches = useMemo(() => {
    const q = (searchContact || "").toLowerCase();
    return (contactList?.unmatches || []).filter((contact) => {
      return (
        (contact.name || "").toLowerCase().includes(q) ||
        (contact.phoneNumber || "").includes(q)
      );
    });
  }, [contactList, searchContact]);

  // Conversation filtering & sorting
  const conversationFilter = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return (conversationList || [])
      .filter((c) => !c.archived)
      .filter((conversation) => {
        if (conversation.type === "DIRECT") {
          const other =
            (conversation.participants || []).find(
              (p) => p.id !== currentUserId
            ) || {};
          const name = (other.name || "").toLowerCase();
          const number = other.phoneNumber || "";
          return name.includes(q) || number.includes(q);
        }
        if (conversation.type === "GROUP") {
          const group = (conversation.groupName || "").toLowerCase();
          return group.includes(q);
        }
        return false;
      })
      .sort((a, b) => {
        const aPinned = a.pinned ? 1 : 0;
        const bPinned = b.pinned ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        const aTime = Number(a.lastMessageAt) || 0;
        const bTime = Number(b.lastMessageAt) || 0;
        return bTime - aTime;
      });
  }, [conversationList, searchQuery, currentUserId]);

  // Context menu click outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && !event.target.closest(".context-menu")) {
        setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // Right click (desktop)
  const handleRightClick = (e, conversationId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      conversationId,
    });
  };

  // long press (mobile)
  const handleTouchStart = (conversationId) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedConversationId(conversationId);
      setContextMenu({ visible: false, x: 0, y: 0, conversationId });
    }, 600);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // menu actions (pin/archive/delete/leave)
  const handleMenuAction = async (action) => {
    const targetId = contextMenu.conversationId || selectedConversationId;
    const targetConversation = conversationList?.find((c) => c.id === targetId);

    if (!targetId) return;

    try {
      switch (action) {
        case "archive":
          await archiveConversation(targetId);
          await getConversationList();
          break;
        case "pin": {
          const isPinned =
            targetConversation?.pinned || targetConversation?.isPinned;
          if (isPinned) await unpinnedConversation(targetId);
          else await pinnedConversation(targetId);
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

  // handle selecting a contact to open/create direct conversation
  const handleContactClick = async (participantId) => {
    try {
      const newConversation = await createDirectConversation(participantId);
      setConversationList((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) return [newConversation];
        const without = prev.filter((c) => c && c.id !== newConversation.id);
        return [newConversation, ...without];
      });
      setOpenContactList(false);
      navigate(`/chats/${newConversation.id}`);
    } catch (e) {
      console.error("Failed to create/open direct conversation", e);
    }
  };

  // group member toggle
  const toggleGroupMember = (contact) => {
    setSelectedGroupContacts((prev) => {
      const exists = prev.some((c) => c.userId === contact.userId);
      if (exists) return prev.filter((c) => c.userId !== contact.userId);
      return [...prev, contact];
    });
    setSearchContact("");
  };

  // group icon interactions (file input control)
  const openGroupIconPicker = () => {
    if (groupIconInputRef.current) groupIconInputRef.current.click();
  };

  const handleGroupIconClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!groupIconPreview) {
      openGroupIconPicker();
      return;
    }
    setShowGroupIconMenu((prev) => !prev);
  };

  const handleGroupIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (groupIconPreview) URL.revokeObjectURL(groupIconPreview);
    setGroupIconFile(file);
    const url = URL.createObjectURL(file);
    setGroupIconPreview(url);
    setShowGroupIconMenu(false);
  };

  const handleRemoveGroupIcon = () => {
    if (groupIconPreview) URL.revokeObjectURL(groupIconPreview);
    setGroupIconFile(null);
    setGroupIconPreview(null);
    setShowGroupIconMenu(false);
    if (groupIconInputRef.current) groupIconInputRef.current.value = "";
  };

  // add contact
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

  // create group
  const handleCreateGroup = async () => {
    const participantIds = selectedGroupContacts.map((c) => c.userId);
    try {
      const newGroup = await createGroupConversation(
        groupName,
        participantIds,
        groupIconFile
      );
      setConversationList((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) return [newGroup];
        const without = prev.filter((c) => c && c.id !== newGroup.id);
        return [newGroup, ...without];
      });

      // reset popup state
      setOpenContactList(false);
      setNewChatScreen("HOME");
      setSelectedGroupContacts([]);
      setGroupName("");
      handleRemoveGroupIcon();
      navigate(`/chats/${newGroup.id}`);
    } catch (e) {
      console.error("Failed to create group", e);
    }
  };

  // context conversation for ContextMenu
  const contextConversation = (conversationList || []).find(
    (c) => c.id === contextMenu.conversationId
  );

  return (
    <div className="w-full flex flex-col h-full bg-card overflow-hidden">
      <ChatHeader
        onNewChat={() => {
          getContactList();
          setOpenContactList((prev) => !prev);
          setNewChatScreen("HOME");
          setSelectedGroupContacts([]);
          setGroupName("");
          setGroupIconFile(null);
          setGroupIconPreview(null);
          setOpenbox(false);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openbox={openbox}
        setOpenbox={setOpenbox}
      />

      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversationFilter}
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          onItemClick={(id) => navigate(`/chats/${id}`)}
          onContextMenu={handleRightClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <FloatingNewChatButton
        onClick={() => {
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

      {openContactList && (
        <NewChatPopup
          contactListRef={contactListRef}
          setOpenContactList ={setOpenContactList}
          filteredMatches={filteredMatches}
          filteredUnmatches={filteredUnmatches}
          selectedGroupContacts={selectedGroupContacts}
          setSelectedGroupContacts={setSelectedGroupContacts}
          searchContact={searchContact}
          setSearchContact={setSearchContact}
          newChatScreen={newChatScreen}
          setNewChatScreen={setNewChatScreen}
          handleContactClick={handleContactClick}
          toggleGroupMember={toggleGroupMember}
          groupIconInputRef={groupIconInputRef}
          groupIconPreview={groupIconPreview}
          groupIconFile={groupIconFile}
          showGroupIconMenu={showGroupIconMenu}
          openGroupIconPicker={openGroupIconPicker}
          handleGroupIconChange={handleGroupIconChange}
          handleGroupIconClick={handleGroupIconClick}
          handleRemoveGroupIcon={handleRemoveGroupIcon}
          groupName={groupName}
          setGroupName={setGroupName}
          newContactPhone={newContactPhone}
          setNewContactPhone={setNewContactPhone}
          newContactName={newContactName}
          setNewContactName={setNewContactName}
          handleAddContact={handleAddContact}
          handleCreateGroup={handleCreateGroup}
        />
      )}

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          conversation={contextConversation}
          onAction={handleMenuAction}
        />
      )}
    </div>
  );
}
