import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/module/homePage/HomePage";
import SignIn from "../pages/auth/SignIn";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ProfileSetup from "../pages/auth/ProfileSetup";
import Layout from "../component/layouts/Layout";
import Chats from "../pages/module/chats/Chats";

export default function PublicRoute() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />

     <Route element={<Layout />}>
        <Route path="/layout" element={<Layout />} />

        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:conversationId" element={<Chats />} />

       

     

     
      

      </Route>
    </Routes>
  );
}
