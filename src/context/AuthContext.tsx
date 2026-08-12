import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../services/auth.ts";
import type { AuthContextValue } from "./AuthContext.ts";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    setSession: (next) => setUser(next),
    logout: () => setUser(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
