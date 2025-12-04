import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FiMessageCircle, FiLock } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import Label from "../../component/uiComponent/Label";
import Button from "../../component/uiComponent/Button";
import useSignIn from "../../hooks/authHooks/useSignIn";
import Toast from "../../component/uiComponent/Toast";

export default function SignIn() {
  const [selectedCountry, setSelectedCountry] = useState({
    name: "India",
    code: "+91",
    flag: "🇮🇳",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toast, setToast] = useState(false);
  const [otp, setOtp] = useState("");


  const navigate = useNavigate();
  const { userSignIn, loading, error } = useSignIn();

  const countries = [
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
    { name: "Singapore", code: "+65", flag: "🇸🇬" },
  ];

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  const handlePhoneSignIn = async (e) => {
    e.preventDefault();

    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const success = await userSignIn(phoneNumber);

    if (success) {
      setOtp(success?.otp)
      setToast(true);
      

      // Toast dikhake thoda delay ke baad navigate
      setTimeout(() => {
        navigate("/verify-otp", { state: { phoneNumber } });
      }, 3000);
    }
  };

  console.log

  return (
    <div className="min-h-screen flex relative">
      {/* ✅ GLOBAL TOAST – mobile + desktop pe dikh jayega */}
      {toast && (
        <Toast
          message="OTP Sent Successfully"
          subMessage={otp ? `Your OTP is ${otp}` : "Please check your phone for the verification code"}
          onClose={() => setToast(false)}
        />
      )}

      <div className="w-full h-screen flex flex-col justify-center">
        <div className="flex items-center justify-start py-2 px-2">
          <button
            className="w-auto relative z-10 flex items-center h-9 rounded-md px-3 hover:bg-accent hover:text-white text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
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
          <div className="w-full md:w-[71%] backdrop-blur-xl shadow-elegant rounded-3xl p-8 animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center shadow-soft relative">
                <FiMessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-3">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-base mb-2">
                Sign in to continue to Chatly
              </p>
            </div>

            <div className="font-heading text-center text-3xl">
              Enter phone number
            </div>
            <p className="text-muted-foreground text-base mb-2 text-center">
              Select a country and enter your phone number.
            </p>

            <form onSubmit={handlePhoneSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone number
                </Label>

                {/* Country + Phone */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center justify-between w-full px-4 h-12 border rounded-full bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <span className="flex items-center gap-3 text-base">
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span className="font-medium">
                          {selectedCountry.name}
                        </span>
                      </span>
                      <FaChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white border rounded-2xl shadow-lg max-h-56 overflow-y-auto">
                        {countries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-primary/10 ${
                              selectedCountry.code === c.code
                                ? "bg-primary/5 font-semibold"
                                : ""
                            }`}
                          >
                            <span className="text-2xl">{c.flag}</span>
                            <span>{c.name}</span>
                            <span className="ml-auto text-muted-foreground">
                              {c.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative w-full">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-700 font-medium">
                      {selectedCountry.code}
                    </div>

                    <input
                      type="tel"
                      placeholder="00000 00000"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        const cleaned = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setPhoneNumber(cleaned);
                      }}
                      className="h-12 w-full pl-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary outline-none"
                      style={{
                        paddingLeft: `calc(${selectedCountry.code.length}ch + 1rem)`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  We'll send you a verification code via SMS
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 gradient-primary text-lg font-semibold shadow-medium hover:shadow-elevated transition-all rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Send verification code"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side illustration (desktop only) */}
      <div className="w-full h-screen hidden md:block">
        <div className="w-full hidden h-full md:flex flex-1 gradient-primary p-12 items-center justify-center relative overflow-hidden">
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
