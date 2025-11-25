import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuPhone, LuRefreshCw } from "react-icons/lu";
import { FaArrowLeft } from "react-icons/fa";

import { FiLock, FiMessageCircle } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { IoCameraOutline } from "react-icons/io5";

import { FaArrowRight } from "react-icons/fa6";
import Button from "../../component/uiComponent/Button";
import Input from "../../component/uiComponent/Input";
import Label from "../../component/uiComponent/Label";
import useSignIn from "../../hooks/authHooks/useSignIn";



export default function ProfileSetup() {
const navigate = useNavigate();
  const location = useLocation();
  const { setupProfile, loading } = useSignIn();

  // Get user info from state (after OTP verification)
  const userFromState = location.state?.user;

  const [name, setName] = useState(userFromState?.name || "");
  const [bio, setBio] = useState(userFromState?.bio || "");
  const [file, setFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userFromState?.profileImage || "");

  // Update preview if user info exists
  useEffect(() => {
    if (userFromState?.profileImage) setAvatarPreview(userFromState.profileImage);
  }, [userFromState]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Call API via useSignIn
    const profile = await setupProfile({ name, bio, file });

    if (profile) {
      console.log("Profile updated:", profile);
      // Navigation handled inside setupProfile
    }
  };

  const handleSkip = () => navigate("/chats");

  return (
    <div className="min-h-screen flex">
      <div className="w-full h-screen flex flex-col justify-center">
        <div className=" flex items-center justify-start py-2 px-2">
          <button
            className="w-auto  relative z-10 flex items-center h-9 rounded-md px-3 hover:bg-accent hover:text-white text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/signin")}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5 z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="h-full flex flex-col items-center justify-center ">
          <div className="w-full md:w-[71%] h-full backdrop-blur-xl shadow-elegant rounded-3xl p-1 px-6 animate-fade-in ">
            <div className=" text-center mb-2  ">
              <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-2 flex items-center justify-center shadow-soft relative ">
                <FaRegUser className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-1">
                Set up your profile
              </h1>
              <p className="text-muted-foreground text-lg">
                Help your friends recognize you
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 flex flex-col items-center"
            >
              <div className="flex flex-col items-center gap-1 ">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted/50 border-4 border-border/50 shadow-medium transition-all group-hover:border-primary/50">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <FaRegUser className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full gradient-primary flex items-center justify-center cursor-pointer shadow-medium hover:shadow-elevated transition-all group-hover:scale-110"
                  >
                    <IoCameraOutline className="w-5 h-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a profile picture
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 ">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium ">
                    Display name  
                
     
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-14 text-lg px-5 rounded-xl"
                    maxLength={50}
                  />
                   <p className="text-xs text-muted-foreground">
                This is how your name will appear to others
              </p>
                 
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    About (optional)
                  </Label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[10px] text-base px-5 py-4 rounded-xl resize-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/150 characters
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-14 gradient-primary text-lg font-semibold shadow-medium hover:shadow-elevated transition-all rounded-xl group"
                    disabled={loading|| !name.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up...
                      </span>
                    ) : (
                      <>
                        Continue to Chatly
                        <FaArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full h-12 text-sm text-muted-foreground hover:text-white"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </form>

            {/* <div className="w-full mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> Make
                sure you have a stable network connection to receive the code.
              </p>
            </div> */}
          </div>
        </div>
      </div>

      <div className="w-full h-screen bg-red-600 hidden md:block">
        <div className="w-full hidden h-full lg:flex flex-1 gradient-primary p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>
          <div className="relative z-10 max-w-lg text-white">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Connect instantly with anyone, anywhere
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Experience seamless communication with end-to-end encryption,
              crystal-clear calls, and instant messaging.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Messaging</h3>
                  <p className="text-sm text-white/80">
                    Send messages, photos, and videos instantly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Private</h3>
                  <p className="text-sm text-white/80">
                    End-to-end encryption for all your conversations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





