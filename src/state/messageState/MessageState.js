import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

// Create persist object INSIDE a function React can control
const { persistAtom } = recoilPersist({
  key: "chatly-session",
});

export const messageAtom = atom({
  key: "messageAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const sendMessageAtom = atom({
  key:"sendMessageAtom",
  default:null,
  effects_UNSTABLE: [persistAtom],
});
