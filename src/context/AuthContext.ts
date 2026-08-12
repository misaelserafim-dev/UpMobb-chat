import type { AuthUser } from "../services/auth.ts";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser) => void;
  logout: () => void;
};
