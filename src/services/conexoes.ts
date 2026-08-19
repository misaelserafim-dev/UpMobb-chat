import { apiRequest } from "@/services/api.ts";

export type SessionStatus = "disconnected" | "qr" | "connecting" | "open";

export type Conexao = {
  id: string;
  name: string;
  provider: string;
  phoneNumber: string;
  phoneNumberId: string | null;
  wabaId: string | null;
  accessTokenMasked: string | null;
  sessionStatus: SessionStatus;
  qrCode: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConexaoSession = {
  provider: string;
  sessionStatus: SessionStatus;
  qrCode: string | null;
  phoneNumber: string;
  connected: boolean;
};

export type FetchConexoesParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchConexoesResult = {
  items: Conexao[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateConexaoPayload = {
  name: string;
};

export type DeleteConexaoPayload = {
  id: string;
};

/** GET /admin/connections — lista completa; busca e paginação aplicadas aqui. */
export async function fetchConexoes(
  params: FetchConexoesParams = {},
): Promise<FetchConexoesResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  const rows = await apiRequest<Conexao[]>("/admin/connections");
  const filtered = q ? rows.filter((c) => c.name.toLowerCase().includes(q)) : rows;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

/** POST /admin/connections */
export async function createConexao(payload: CreateConexaoPayload): Promise<Conexao> {
  return apiRequest<Conexao>("/admin/connections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /admin/connections/:id/connect */
export async function connectConexao(id: string): Promise<ConexaoSession> {
  return apiRequest<ConexaoSession>(`/admin/connections/${encodeURIComponent(id)}/connect`, {
    method: "POST",
  });
}

/** GET /admin/connections/:id/session */
export async function fetchConexaoSession(id: string): Promise<ConexaoSession> {
  return apiRequest<ConexaoSession>(`/admin/connections/${encodeURIComponent(id)}/session`);
}

/** POST /admin/connections/:id/disconnect */
export async function disconnectConexao(id: string): Promise<ConexaoSession> {
  return apiRequest<ConexaoSession>(`/admin/connections/${encodeURIComponent(id)}/disconnect`, {
    method: "POST",
  });
}

/** DELETE /admin/connections/:id */
export async function deleteConexao(
  payload: DeleteConexaoPayload,
): Promise<{ id: string }> {
  await apiRequest<{ deleted: boolean }>(`/admin/connections/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
  return { id: payload.id };
}
