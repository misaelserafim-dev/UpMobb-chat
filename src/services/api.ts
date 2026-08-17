/**
 * Cliente HTTP central.
 * Base URL vem de `.env` → VITE_API_URL
 * Vazio = usa mocks em `src/data` (delete a pasta ao plugar o backend).
 *
 * Backend chat: respostas seguem o envelope
 * `{ success: true, data }` · lista `{ success, data, page }` · erro `{ error }`.
 * apiRequest devolve o miolo já desembrulhado.
 */
export const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "chat.token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export type ListPage = {
  page: number;
  limit: number;
  total: number;
};

export type ApiListResult<T> = {
  data: T[];
  page: ListPage | null;
};

async function mockRequest(method: string, path: string, body?: unknown) {
  const pathname = path.split("?")[0];

  if (pathname.startsWith("/chats")) {
    const { mockChatsRequest } = await import("@/data/chats.ts");
    return mockChatsRequest(method, path, body);
  }
  if (pathname.startsWith("/contacts")) {
    const { mockContactsRequest } = await import("@/data/contacts.ts");
    return mockContactsRequest(method, path, body);
  }
  if (pathname.startsWith("/departamentos")) {
    const { mockDepartamentosRequest } = await import("@/data/departamentos.ts");
    return mockDepartamentosRequest(method, path, body);
  }
  if (pathname.startsWith("/equipe")) {
    const { mockEquipeRequest } = await import("@/data/equipe.ts");
    return mockEquipeRequest(method, path, body);
  }
  if (pathname.startsWith("/etiquetas")) {
    const { mockEtiquetasRequest } = await import("@/data/etiquetas.ts");
    return mockEtiquetasRequest(method, path, body);
  }
  if (pathname.startsWith("/respostas-rapidas")) {
    const { mockRespostasRapidasRequest } = await import("@/data/respostasRapidas.ts");
    return mockRespostasRapidasRequest(method, path, body);
  }

  throw new Error(`Mock route not found: ${method} ${pathname}`);
}

async function realRequest(path: string, init?: RequestInit) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && typeof payload.error === "string"
        ? payload.error
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return payload;
}

/** Devolve só o `data` do envelope. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (API_BASE) {
    const payload = await realRequest(path, init);
    return (payload?.data ?? payload) as T;
  }

  const method = init?.method || "GET";
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  return (await mockRequest(method, path, body)) as T;
}

/** Devolve `data` + `page` (rotas de lista paginada do backend). */
export async function apiListRequest<T>(path: string, init?: RequestInit): Promise<ApiListResult<T>> {
  const payload = await realRequest(path, init);
  return {
    data: (payload?.data ?? []) as T[],
    page: (payload?.page ?? null) as ListPage | null,
  };
}
