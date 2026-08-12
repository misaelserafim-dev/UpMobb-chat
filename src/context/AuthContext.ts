export type AuthUser = {
  id: string;
  name: string;
} | null;

export type AuthContextValue = {
  user: AuthUser;
  isAuthenticated: boolean;
};
