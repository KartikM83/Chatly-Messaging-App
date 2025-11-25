import { recoilPersist } from "recoil-persist";

const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : undefined;

export const sessionStoragePersist = recoilPersist({
  key: 'session-persist',
  storage: sessionStorage,
});

export const createPersistedAtom = (key, defaultValue) => ({
  key,
  default: defaultValue,
  effects_UNSTABLE: [sessionStoragePersist.persistAtom],
});