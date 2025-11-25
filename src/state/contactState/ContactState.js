import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

// Create persist object INSIDE a function React can control
const { persistAtom } = recoilPersist({
  key: "chatly-session",
});

export const contactListAtom = atom({
  key: "contactListAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
});


export const conversationListAtom = atom({
  key:"conversationListAtom",
  default:null,
  effects_UNSTABLE:[persistAtom]
});

export const conversationByIdAtom = atom({
  key:"conversationByIdAtom",
  default:null,
  effects_UNSTABLE:[persistAtom]
});
