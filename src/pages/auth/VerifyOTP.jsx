import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuPhone, LuRefreshCw } from "react-icons/lu";
import { FaArrowLeft } from "react-icons/fa";

import { FiLock, FiMessageCircle } from "react-icons/fi";
import Button from "../../component/uiComponent/Button";
import useSignIn from "../../hooks/authHooks/useSignIn";

// Single OTP Input Box
const InputOTPSlot = ({ value, isActive, onChange, onBackspace }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isActive) inputRef.current.focus();
  }, [isActive]);

  return (
    <input
      ref={inputRef}
      type="text"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && !value) onBackspace();
      }}
      className="w-16 h-16 text-2xl font-bold border-2 rounded-2xl text-center focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    />
  );
};

// OTP Input Group (4 inputs)
const InputOTPGroup = ({ otp, setOtp }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < otp.length - 1) setActiveIndex(idx + 1);
  };

  const handleBackspace = (idx) => {
    if (idx > 0) setActiveIndex(idx - 1);
  };

  return (
    <div className="flex gap-4 justify-center">
      {otp.map((digit, idx) => (
        <InputOTPSlot
          key={idx}
          value={digit}
          isActive={activeIndex === idx}
          onChange={(e) => handleChange(e, idx)}
          onBackspace={() => handleBackspace(idx)}
        />
      ))}
    </div>
  );
};

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || "+1 (555) 000-0000";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtp, loading: verifyLoading } = useSignIn();


  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    setTimeLeft(60);
    setCanResend(false);
  };

  const handleVerify = async (e) => {
  e.preventDefault();

  const code = otp.join(""); // “1234”

  if (code.length !== 4) return;

  setIsLoading(true);

  const res = await verifyOtp(phoneNumber, code);
  

  setIsLoading(false);

  // If OTP fails, do nothing (useSignIn already handles errors)
  if (!res) return;

  // Navigation is handled INSIDE verifyOtp — no need to navigate here
};


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

        <div className="w-fit backdrop-blur-sm  shadow-elegant rounded-3xl p-12 animate-fade-in ">
          <div className=" text-center mb-4  ">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center shadow-soft relative ">
              <LuPhone className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold mb-3">
              Verify your number
            </h1>
            <p className="text-muted-foreground text-base mb-2">
              Enter the 4-digit code we sent to
            </p>
            <p className="font-semibold text-lg text-foreground">
              {phoneNumber}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8 flex flex-col items-center">
            <InputOTPGroup otp={otp} setOtp={setOtp} />

            <div className="text-center mt-6">
              {!canResend ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-primary hover:underline font-medium flex items-center gap-2 mx-auto group"
                >
                  <LuRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Resend verification code
                </button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full  h-14 gradient-primary text-lg font-semibold shadow-medium hover:shadow-elevated transition-all rounded-xl"
              disabled={isLoading || verifyLoading || otp.some((d) => d === "")}

            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </form>

          <div className="w-full mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Make
              sure you have a stable network connection to receive the code.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
          Wrong number?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-primary hover:underline font-medium"
          >
            Change number
          </button>
        </p>
        </div>

        
      </div>

      </div>

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
