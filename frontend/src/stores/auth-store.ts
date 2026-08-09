/** Session display state; credentials remain in HTTP-only backend cookies. */

import { create } from "zustand";

import {
  authApi,
  refreshAuthSession,
  setSessionExpiredHandler,
  type User,
} from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authApi.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authApi.register(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    get().clearSession();
    try {
      await authApi.logout();
    } catch {
      // Clear the local view even when the backend cannot be reached.
    }
  },
  refreshAccessToken: () => refreshAuthSession(),
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      get().clearSession();
    } finally {
      set({ isLoading: false });
    }
  },
}));

setSessionExpiredHandler(() => useAuthStore.getState().clearSession());
