import { create } from "zustand";

type UserStore = {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
