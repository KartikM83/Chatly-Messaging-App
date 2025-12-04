import { LuArchive, LuMessageSquarePlus } from "react-icons/lu";
import IconButton from "../uiComponent/IconButton";

import SearchInput from "../uiComponent/SearchInput";

import Avatar from "../uiComponent/Avatar";
import useContact from "../../hooks/contactHook/useContact";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { RiDeleteBin6Line, RiUnpinLine } from "react-icons/ri";
import { BsPinAngle, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlinePhotoCamera } from "react-icons/md";
import useConversation from "../../hooks/conversationHook/useConversation";
import { HiUsers } from "react-icons/hi";
import { IoMdArrowBack } from "react-icons/io";
import { FiCamera } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

export default function ArchivedList() {
  const [openbox, setOpenbox] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  // Crete Conversation

  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const {
    contactList,

    getConversationList,
    conversationList,
  } = useContact();

  const { unarchiveConversation,deleteConversation } = useConversation();

  useEffect(() => {
    getConversationList();
  }, []);

  const { conversationId: activeConversationId } = useParams();

  console.log("matches", contactList?.matches);

  // ✅ Context menu state (Desktop)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    conversationId: null,
  });

  //   const contactListRef = useRef(null);
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
      setContextMenu({ visible: false, conversationId }); // don't show floating menu on mobile
    }, 600);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // ✅ Context Menu / Header Action Handler
  const handleMenuAction = async (action) => {
    const targetId = contextMenu.conversationId || selectedConversationId;
    if (!targetId) return;

    try {
      switch (action) {
        case "unarchive": {
          const res = await unarchiveConversation(targetId); // ✅ wait for backend
          console.log("Archive action response: ", res);

          // OPTION 1: refetch from backend
          await getConversationList();

          // OPTION 2: or optimistically update local list:
          // setConversationList(prev =>
          //   prev.map(c =>
          //     c.id === targetId ? { ...c, archived: true } : c
          //   )
          // );

          break;
        }
         case "delete":
        await deleteConversation(targetId);
        await getConversationList();
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
    .filter((conversation) => conversation.archived)
    .filter((conversation) => {
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
            <span className="hidden md:inline">Archived</span>
            <span className="inline md:hidden">Chatly</span>
          </h1>

          {/* ✅ Mobile Header Actions */}

          <div className="md:hidden flex items-center gap-2">
            {selectedConversationId ? (
              <>
                <button onClick={() => handleMenuAction("pin")}>
                  {conversationList.find((c) => c.id === selectedConversationId)
                    ?.isPinned ? (
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
                onClick={() => navigate(`/archived/${conversation.id}`)}
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
                      {/* {chat.isPinned && (
              <LuPin className="w-3.5 h-3.5 text-muted-foreground" />
            )} */}
                      {/* {conversation.archived && (
              <div className="bg-primary text-white text-[10px] px-1 rounded-[2px]">
                archived
              </div>
            )} */}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center ">
                    <p className="text-sm w-40 text-muted-foreground truncate">
                      {conversation.lastMessage
                        ? conversation.lastMessage
                        : "No messages yet"}
                    </p>

                    <div className="flex gap-2">
                    {conversation.archived && (
                      <div className="bg-primary font-heading text-white text-[11px] px-1 py-1 rounded-[2px] ">
                        archived
                      </div>
                    )}
                     {conversation.unreadCount  ===0 ? "" :
                      <div className="bg-primary font-heading text-white text-[11px] px-2 py-0.5 flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                      </div>
          }
          </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ Desktop Context Menu */}
      {contextMenu.visible && (
        <div
          className="hidden md:block context-menu absolute bg-white rounded-xl shadow-lg border w-44 py-2"
          style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 9 }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("unarchive")}
          >
            <div className="flex items-center gap-1">
              <LuArchive className="w-5 h-5" /> Unarchive Chat
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
        </div>
      )}
    </div>
  );
}
