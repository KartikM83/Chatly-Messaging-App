import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

// Create persist object INSIDE a function React can control
const { persistAtom } = recoilPersist({
  key: "chatly-session",
});

export const otpVerifyAtom = atom({
  key: "otpVerifyAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const adminResponseAtom = atom({
  key: "adminResponseAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
