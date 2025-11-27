import { atom } from "recoil";  
import { recoilPersist } from "recoil-persist";

// Create persist object INSIDE a function React can control
const { persistAtom } = recoilPersist({
  key: "chatly-session",
});         

export const conversationStateAtom = atom({
  key: "conversationStateAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
}); 