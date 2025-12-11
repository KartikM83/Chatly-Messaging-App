// src/components/profile/ProfileSidePanel.jsx
import { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import Avatar from "../uiComponent/Avatar";
import useSignIn from "../../hooks/authHooks/useSignIn";
import SearchInput from "../uiComponent/SearchInput";

const TABS = ["Overview", "Media", "Files", "Links", "Events", "Encryption"];

export default function ProfileSidePanel({
  open,
  onClose,
  contact, // { id, name, phoneNumber, profileImage, bio, groupParticipants, adminId, ... }
  isSelf = false, // current logged-in user ?
  conversationId, // for group / conversation editing
  isGroup = false,
  canEditConversation = false, // e.g. group admin
  onConversationUpdated, // callback when group updated
  onContactNameUpdated, // for direct chats, local name update
}) {
  const {
    setupProfile,
    updateConversationProfile,
    loading: authLoading,
  } = useSignIn();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?.id;

  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(contact?.name || "");
  const [bio, setBio] = useState(contact?.bio || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchContact, setSearchContact] = useState("");

  useEffect(() => {
    if (!contact) return;

    setName(contact.name || "");
    setBio(contact.bio || "");
    setFile(null);
    setIsEditing(false);
    setActiveTab("Overview");
    setSearchContact("");
  }, [contact, open]);

  if (!open || !contact) return null;

  // ===== PERMISSION LOGIC =====
  const canEditGroup = isGroup && canEditConversation; // group admin
  const canEditSelf = isSelf;
  const isDirectOther = !isGroup && !isSelf;

  const canEditPhoto = canEditSelf || canEditGroup;
  const canEditName = canEditSelf || canEditGroup || isDirectOther;
  const canEditBio = canEditSelf || canEditGroup;

  const loading = authLoading || saving;

  const handleImageChange = (e) => {
    if (!canEditPhoto) return;
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!isEditing) return;

    try {
      setSaving(true);

      // 1️⃣ SELF PROFILE: /profile-setup
      if (canEditSelf) {
        await setupProfile({ name, bio, file });
      }
      // 2️⃣ GROUP PROFILE: PUT /conversations/{id}
      else if (canEditGroup && conversationId) {
        const updated = await updateConversationProfile({
          conversationId,
          name,
          description: bio,
          file,
        });

        if (updated && onConversationUpdated) {
          onConversationUpdated(updated);
        }
      }
      // 3️⃣ DIRECT CONTACT (ONLY NAME, LOCAL)
      else if (isDirectOther && canEditName && onContactNameUpdated) {
        onContactNameUpdated(contact.id, name);
      }

      setIsEditing(false);
      setFile(null);
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ===== GROUP MEMBERS FILTER (proper) =====
  const filteredMembers = Array.isArray(contact.groupParticipants)
    ? contact.groupParticipants.filter((member) => {
        const q = searchContact.trim().toLowerCase();
        if (!q) return true;
        const nameMatch = member.name?.toLowerCase().includes(q);
        const phoneMatch = member.phoneNumber?.includes(q);
        return nameMatch || phoneMatch;
      })
    : [];

  return (
    // Overlay (mobile + desktop)
    <div
      className="
        fixed inset-0 z-[1000]
        bg-black/10
        flex items-center justify-center
        md:items-start md:justify-start
      "
      onClick={onClose}
    >
      {/* Panel container (stops close on inner click) */}
      <div
        className="
          w-full h-full
          md:w-[450px] md:h-[75%]
          md:mt-16 md:ml-[430px]
          bg-card rounded-none md:rounded-lg shadow-lg
          flex
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT MENU (Desktop only) */}
        <div className="hidden md:flex flex-col w-32 bg-gray-100 text-black rounded-l-[6px]">
          <nav className="flex-1 mt-2 text-sm">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-300 ${
                  activeTab === tab ? "bg-gray-300 font-semibold" : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-card overflow-y-auto relative rounded-r-[6px]">
          {/* Mobile header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-[#202c33] md:hidden">
            <button
              type="button"
              onClick={onClose}
              className="text-black hover:text-white"
            >
              <IoIosArrowBack size={20} />
            </button>
            <span className="text-sm font-semibold">
              {isGroup ? "Group info" : "Contact info"}
            </span>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <div className="px-2 py-6 flex flex-col items-center">
              {/* Avatar + edit icon */}
              <div className="relative">
                <Avatar
                  src={contact.profileImage}
                  alt={contact.name}
                  size="xxl"
                />
                {canEditPhoto && (
                  <>
                    <label
                      htmlFor="profile-photo-input"
                      className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/80"
                    >
                      <FiEdit2 size={14} className="text-white" />
                    </label>
                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                )}
              </div>

              {/* Name + edit toggle */}
              <div className="mt-4 ml-4 flex items-center justify-center w-full gap-2 text-black">
                {isEditing && canEditName ? (
                  <input
                    className="bg-transparent border-b border-gray-500 focus:outline-none text-lg text-center"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-center">
                    {name || "Unknown"}
                  </h2>
                )}

                {canEditName && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="text-gray-300 hover:text-white ml-1"
                    title="Edit"
                  >
                    <FiEdit2 size={16} className="text-black" />
                  </button>
                )}
              </div>

              {/* Bio / About / Description */}
              <div className="mt-6 w-full max-w-sm px-3">
                <p className="text-xs uppercase text-black mb-1 font-bold">
                  {isGroup ? "Description" : "About"}
                </p>
                {isEditing && canEditBio ? (
                  <textarea
                    className="w-full bg-transparent border border-gray-500 rounded-md px-2 py-1 text-sm resize-none focus:outline-none"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    {bio ||
                      (isGroup
                        ? "No description"
                        : "~Hey there! I am using Chatly.")}
                  </p>
                )}
              </div>

              {/* Phone (for direct chats only) */}
              {!isGroup && (
                <div className="mt-4 w-full max-w-sm px-3">
                  <p className="text-xs uppercase text-black mb-1 font-bold">
                    Phone Number
                  </p>
                  {contact.phoneNumber && (
                    <p className="mt-1 text-sm text-gray-500">
                      {contact.phoneNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Extra static fields */}
              <div className="mt-4 w-full max-w-sm space-y-4 text-sm px-3">
                <div>
                  <p className="text-xs uppercase text-black font-bold mb-1">
                    Disappearing messages
                  </p>
                  <p className="text-gray-500">Off</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-black font-bold mb-1">
                    Advanced chat privacy
                  </p>
                  <p className="text-gray-500 text-xs">
                    This setting can only be updated on your phone.
                  </p>
                </div>
              </div>

              {/* GROUP MEMBERS SECTION */}
              {isGroup && (
                <div className="mt-4 w-full max-w-sm px-3">
                  <p className="text-xs uppercase text-black font-bold mb-2">
                    Group Members
                  </p>

                  <SearchInput
                    value={searchContact}
                    onChange={setSearchContact}
                    placeholder="Search name or number"
                  />

                  {filteredMembers.length > 0 ? (
                    <div className="mt-3 text-sm text-gray-500 space-y-1 max-h-48 overflow-y-auto">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <Avatar
                            src={member.profileImage}
                            alt={member.name}
                            size="md"
                          />
                          <div className="w-full flex flex-col">
                            <span className="font-medium text-[13px] text-foreground">
                              {member.id === currentUserId
                                ? "You"
                                : member.name}
                            </span>

                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">
                                {member.phoneNumber}
                              </span>
                              {member.id === contact.adminId && (
                                <span className="bg-primary font-heading text-white px-1 text-[11px] rounded-[2px]">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No members found.
                    </p>
                  )}
                </div>
              )}

              {/* Save button */}
              {isEditing && (canEditSelf || canEditGroup || isDirectOther) && (
                <div className="mt-4 w-full flex items-center justify-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSave}
                    className="px-4 py-2 rounded-md bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OTHER TABS (stub) */}
          {activeTab !== "Overview" && (
            <div className="px-6 py-6 text-sm text-gray-300">
              <p className="opacity-70">
                {activeTab} section UI abhi stub hai. Baad mein yaha media /
                files / links load kar sakte ho.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
