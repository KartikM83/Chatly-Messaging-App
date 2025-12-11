// useSignIn.js
import { useNavigate } from "react-router-dom";
import useFetch from "../useFetch";
import { useState } from "react";
import { adminResponseAtom, otpVerifyAtom } from "../../state/authState/authState";
import conf from "../../config/index";
import { useRecoilState } from "recoil";

const useSignIn = () => {
  const [fetchData] = useFetch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [adminResponse, setAdminResponse] = useRecoilState(adminResponseAtom);
  const [otpResponse, setOtpResponse] = useRecoilState(otpVerifyAtom);
  const [error, setError] = useState(null);

  // ------------------- USER SIGN IN -------------------
  const userSignIn = async (phoneNumber) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}auth/send-otp`,
        data: { phoneNumber },
      });

      //  alert("Profile setup response:"+res.otp);

      if (res?.ok === false) throw new Error(await res.text() || `Send OTP failed: ${res.status}`);
      if (res?.status && res.status >= 400) throw new Error(res.data?.message || "Failed to send OTP");

      setAdminResponse(res?.data || res);
      setLoading(false);


      return { success: true, otp: res.otp };
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to send OTP. Try again.");
       return false; 
    }
  };

  // ------------------- VERIFY OTP -------------------
  const verifyOtp = async (phoneNumber, otp) => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetchData({
      method: "POST",
      url: `${conf.apiBaseUrl}auth/verify-otp`,
      data: { phoneNumber, otp },
    });

    if (res?.ok === false)
      throw new Error((await res.text()) || "OTP verification failed");
    if (res?.status && res.status >= 400)
      throw new Error(res?.data?.errorMessage || "OTP verification failed");

    const data = res?.data || res;
    if (!data) throw new Error("Invalid API response");

    // ✅ yahi sahi jagah hai user save karne ki
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    setAdminResponse(data);
    sessionStorage.setItem("token", data.accessToken);

    navigate("/profile-setup", {
      state: {
        isNew: data.isNew,
        user: data.user || null,
      },
    });

    return data;
  } catch (err) {
    setError(err.message || "OTP verification failed");
    return null;
  } finally {
    setLoading(false);
  }
};

  // ------------------- PROFILE SETUP -------------------
  const setupProfile = async ({ name, bio, file }) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (name) formData.append("name", name);
      if (bio) formData.append("bio", bio);

      const res = await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}profile-setup`,
        data: formData,
      });

     

      if (res?.status && res.status >= 400) throw new Error(res?.data?.error || "Failed to update profile");

      const profile = res?.profile || res?.data?.profile;

      // Update Recoil state with updated profile
      setAdminResponse((prev) => ({ ...prev, user: profile }));

      // Navigate to chats after successful profile setup
      navigate("/chats");

      return profile;
    } catch (err) {
      setError(err.message || "Profile setup failed");
      console.error("Profile setup error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

   const logout = async () => {
    const accessToken = sessionStorage.getItem("token");

    try {
      // optional: send token to backend (for logging / future blacklist use)
      await fetchData({
        method: "POST",
        url: `${conf.apiBaseUrl}auth/logout`,
        data: { accessToken },
      });
    } catch (err) {
      console.error("Logout API failed (ignoring):", err);
      // even if API fails, we still clear client state
    } finally {
      // clear client-side auth
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("chatly-session"); 
      setAdminResponse(null);
      setOtpResponse(null);
      setError(null);

      navigate("/signin");
    }
  };


  const updateConversationProfile = async ({
    conversationId,
    name,
    description, // group description / bio
    file,
  }) => {
    if (!conversationId) return null;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      const data = {};

      if (name) data.name = name;
      if (description) data.groupDescription = description; // match your CreateConversationRequest field

      // always send data, even if only name changed
      formData.append("data", JSON.stringify(data));
      if (file) {
        formData.append("file", file);
      }

      const res = await fetchData({
        method: "PUT",
        url: `${conf.apiBaseUrl}conversations/${conversationId}`,
        data: formData,
      });

      if (res?.status && res.status >= 400)
        throw new Error(res?.data?.error || "Failed to update conversation");

      return res?.data || res;
    } catch (err) {
      console.error("updateConversationProfile error:", err);
      setError(err.message || "Failed to update conversation");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    userSignIn,
    verifyOtp,
    setupProfile,
    updateConversationProfile,
    loading,
    error,
    logout
  };
};

export default useSignIn;
