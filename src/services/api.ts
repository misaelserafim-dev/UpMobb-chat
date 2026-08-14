/**
 * Cliente HTTP central.
 * Base URL vem de `.env` → VITE_API_URL
 * Vazio = usa mocks em `src/data` (delete a pasta ao plugar o backend).
 */
export const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

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

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  const method = init?.method || "GET";
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  return (await mockRequest(method, path, body)) as T;
}
