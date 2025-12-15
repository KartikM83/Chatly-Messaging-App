// src/features/chat/components/NewChatPopup.jsx
import React from "react";

import { HiUsers } from "react-icons/hi";
import { IoMdArrowBack } from "react-icons/io";
import { FaUser, FaUserAlt } from "react-icons/fa";
import GroupIconPicker from "./GroupIconPicker";
import Avatar from "../uiComponent/Avatar";
import IconButton from "../uiComponent/IconButton";

/**
 * NewChatPopup is mostly presentational. The parent passes the handlers and state.
 */
export default function NewChatPopup({
  contactListRef,
  filteredMatches,
  filteredUnmatches,
  selectedGroupContacts,
  setSelectedGroupContacts,
  searchContact,
  setSearchContact,
  newChatScreen,
  setNewChatScreen,
  handleContactClick,
  toggleGroupMember,
  groupIconInputRef,
  groupIconPreview,
  // groupIconFile,
  showGroupIconMenu,
  openGroupIconPicker,
  handleGroupIconChange,
  handleGroupIconClick,
  handleRemoveGroupIcon,
  groupName,
  setGroupName,
  newContactPhone,
  setNewContactPhone,
  newContactName,
  setNewContactName,
  handleAddContact,
  handleCreateGroup,
  setOpenContactList,
}) {
  return (
    <div
  className="fixed inset-0 z-[1000] flex justify-center items-end md:items-start bg-black/40 md:bg-transparent"
  onClick={() => setOpenContactList(false)}
>
  <div
    ref={contactListRef}
    className="w-full h-[100%] bg-card shadow-lg overflow-hidden md:rounded-[8px] md:w-[330px] md:h-[500px] md:absolute md:top-[109px] md:left-[370px] pointer-events-auto"
    onClick={(e) => e.stopPropagation()} 
  >
        <div className="relative w-full h-full">
          {/* SCREEN 1: HOME */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-200 ${
              newChatScreen === "HOME" ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col gap-2 px-4 py-4 border-b">
              <div className="flex items-center gap-2">
                <IconButton
                  icon={IoMdArrowBack}
                  variant="ghost"
                  onClick={() => setNewChatScreen("HOME")}
                  ariaLabel="Back"
                  className="md:hidden"
                />
                <span className="text-xl font-heading font-bold">New chat</span>
              </div>

              <div>
                {/* SearchInput from your UI kit */}
                <input
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                  placeholder="Search name or number"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
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
                  onClick={() => setNewChatScreen("NEW_CONTACT")}
                >
                  <Avatar src={<FaUser />} alt="New Contact" size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">New contact</h3>
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
                    <Avatar src={contact.profileImage} alt={contact.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{contact.bio}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUnmatches.map((contact) => (
                <div key={contact.phoneNumber} className="px-4 py-3 hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar src={null} alt={contact.name} size="md">
                      <FaUserAlt />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{contact.bio}</p>
                    </div>
                    <span className="text-primary font-bold">invite</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SCREEN 2: GROUP_SELECT */}
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

                <div className="flex items-center gap-2 flex-wrap bg-muted rounded-lg px-2 py-1 min-h-[40px]">
                  {selectedGroupContacts.map((c) => (
                    <div key={c.userId} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs">
                      <span className="max-w-[90px] truncate">{c.name}</span>
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
                <div className="px-3 text-sm font-heading font-bold">All contacts</div>

                {filteredMatches.map((contact) => {
                  const isSelected = selectedGroupContacts.some((c) => c.userId === contact.userId);
                  return (
                    <div
                      key={contact.userId}
                      className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleGroupMember(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={contact.profileImage} alt={contact.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{contact.bio}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <span className="text-[12px] text-card">✓</span>}
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
                    // close popup and reset
                    setNewChatScreen("HOME");
                    setSelectedGroupContacts([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: GROUP_DETAILS */}
          {newChatScreen === "GROUP_DETAILS" && (
            <div className="absolute inset-0 flex flex-col bg-card animate-[slideIn_0.2s_ease-out]">
              <div className="flex flex-col gap-2 px-4 py-4 border-b">
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

                <div className="flex items-center gap-2 flex-wrap bg-muted rounded-lg px-2 py-1 min-h-[40px]">
                  {selectedGroupContacts.map((c) => (
                    <div key={c.userId} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-card text-xs">
                      <span className="max-w-[90px] truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                {/* Group icon */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleGroupIconClick}
                      className="w-12 h-12 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {groupIconPreview ? (
                        <img src={groupIconPreview} alt="Group" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground">+</div>
                      )}
                    </button>

                    <input ref={groupIconInputRef} type="file" accept="image/*" className="hidden" onChange={handleGroupIconChange} />

                    {showGroupIconMenu && groupIconPreview && (
                      <div className="absolute top-14 left-0 z-50 w-40 bg-card border rounded-lg shadow-lg py-1 text-sm">
                        <button className="w-full text-left px-3 py-2 hover:bg-muted/60" onClick={() => { openGroupIconPicker(); }}>
                          Change photo
                        </button>
                        <button className="w-full text-left px-3 py-2 text-destructive hover:bg-muted/60" onClick={handleRemoveGroupIcon}>
                          Remove photo
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Add group icon <span className="opacity-70">(optional)</span>
                  </div>
                </div>

                {/* Group name */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Provide a group name</span>
                  <input
                    type="text"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Group name (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-4 py-3 border-t flex gap-2">
                <button
                  className="flex-1 h-9 rounded-md bg-primary text-card text-sm font-medium disabled:opacity-50"
                  disabled={selectedGroupContacts.length === 0}
                  onClick={handleCreateGroup}
                >
                  Create
                </button>
                <button className="flex-1 h-9 rounded-md border text-sm font-medium" onClick={() => setNewChatScreen("HOME")}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* NEW_CONTACT screen */}
          {newChatScreen === "NEW_CONTACT" && (
            <div className="absolute inset-0 flex flex-col bg-card animate-[slideIn_0.2s_ease-out]">
              <div className="flex flex-col gap-2 px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                  <IconButton icon={IoMdArrowBack} variant="ghost" ariaLabel="Back" onClick={() => setNewChatScreen("HOME")} />
                  <span className="text-xl font-heading font-bold">New contact</span>
                </div>
              </div>

              <div className="w-full flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center gap-4">
                <Avatar src={<FaUser />} alt="New Contact" size="xl" />
                <div className="w-full flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Phone Number</span>
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
                  <span className="text-sm text-muted-foreground">Name</span>
                  <input
                    type="text"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-4 py-3 border-t flex gap-2">
                <button className="flex-1 h-9 rounded-md bg-primary text-card text-sm font-medium" onClick={handleAddContact}>
                  Add
                </button>
                <button
                  className="flex-1 h-9 rounded-md border text-sm font-medium"
                  onClick={() => {
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
  );
}
