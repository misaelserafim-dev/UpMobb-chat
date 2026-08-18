import { API_BASE, apiRequest, setAuthToken } from "@/services/api.ts";
import { disconnectSocket } from "@/services/socket.ts";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

const USER_KEY = "chat.user";

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  disconnectSocket();
  setAuthToken(null);
  localStorage.removeItem(USER_KEY);
}

/** POST /auth/login — guarda token JWT + usuário para as próximas requests. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (!payload.email.trim() || !payload.password) {
    throw new Error("Informe e-mail e senha.");
  }

  // Sem backend: sessão mock (websocket fica inativo via getSocket → null)
  if (!API_BASE) {
    const data: LoginResponse = {
      token: "mock-token",
      user: {
        id: "u-mock",
        name: payload.email.trim().split("@")[0] || "Demo",
        email: payload.email.trim(),
        role: "admin",
      },
    };
    setAuthToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email.trim(), password: payload.password }),
  });

  setAuthToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!email.trim()) {
    throw new Error("Informe o e-mail.");
  }
  // Backend ainda não tem redefinição de senha; a tela mostra a mensagem genérica.
}
