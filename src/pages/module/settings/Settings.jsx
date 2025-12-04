import { FaRegUser } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { FaRegBell } from "react-icons/fa";
import { MdOutlinePalette } from "react-icons/md";
import { IoMdArrowBack, IoMdHelpCircleOutline } from "react-icons/io";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { HiOutlineChevronRight } from "react-icons/hi";

import { useState } from "react";

import { useNavigate } from "react-router-dom";
import Avatar from "../../../component/uiComponent/Avatar";
import IconButton from "../../../component/uiComponent/IconButton";
import { Switch } from "../../../component/uiComponent/Switch";
import useSignIn from "../../../hooks/authHooks/useSignIn";

export default function Setting() {
  const navigate = useNavigate();

  const { logout } = useSignIn();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  console.log("Current User in Settings:", currentUser);

  const [darkMode, setDarkMode] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: FaRegUser, label: "Profile", hasArrow: true },
        { icon: FiLock, label: "Privacy", hasArrow: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: FaRegBell, label: "Notifications", hasArrow: true },
        { icon: MdOutlinePalette, label: "Theme", hasArrow: true },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: IoMdHelpCircleOutline, label: "Help Center", hasArrow: true },
        { icon: IoMdInformationCircleOutline, label: "About", hasArrow: true },
      ],
    },
  ];

  const handleBack = () => {
    navigate("/chats"); // Back to chat list
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-card border-b px-4 py-4 flex gap-3 items-center ">
        {handleBack && (
          <IconButton
            icon={IoMdArrowBack}
            variant="ghost"
            onClick={handleBack}
            ariaLabel="Back to chats"
            className="md:hidden"
          />
        )}

        <h1 className="text-2xl font-heading font-semibold">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Profile Section */}
        <div className="px-4 py-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar src={currentUser?.profileImage} alt="You" size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-heading font-semibold">
                {currentUser?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentUser?.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="py-2">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
                {section.title}
              </h3>
              <div className="bg-card border-y divide-y divide-border">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-smooth"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.hasArrow && (
                      <HiOutlineChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Toggles */}
          <div className="mb-4">
            <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
              Quick Settings
            </h3>
            <div className="bg-card border-y divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3">
                <span>Dark Mode</span>
                <Switch checked={darkMode} onChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Read Receipts</span>
                <Switch checked={readReceipts} onChange={setReadReceipts} />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Online Status</span>
                <Switch checked={onlineStatus} onChange={setOnlineStatus} />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-red-600/10 cursor-pointer">
                <span className="font-semibold text-red-600 " onClick={logout}>
                  Logout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Chatly Web v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
