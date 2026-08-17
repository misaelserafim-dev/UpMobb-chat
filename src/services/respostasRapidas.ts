import { apiRequest } from "@/services/api.ts";

export type RespostaRapida = {
  id: string;
  shortcut: string;
  text: string;
};

export type FetchRespostasRapidasParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchRespostasRapidasResult = {
  items: RespostaRapida[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateRespostaRapidaPayload = {
  shortcut: string;
  text: string;
};

export type UpdateRespostaRapidaPayload = {
  id: string;
  shortcut: string;
  text: string;
};

export type DeleteRespostaRapidaPayload = {
  id: string;
};

/** Autocomplete do composer — leitura via /panel/quick-replies (admin e agente). */
export async function filterRespostasRapidas(
  params: { query?: string; limit?: number } = {},
): Promise<RespostaRapida[]> {
  const q = (params.query || "").trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, params.limit || 8));

  const rows = await apiRequest<RespostaRapida[]>("/panel/quick-replies");
  const filtered = q
    ? rows.filter(
        (r) => r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
      )
    : rows;
  return filtered.slice(0, limit);
}

/** GET /admin/quick-replies — lista completa; busca e paginação aplicadas aqui. */
export async function fetchRespostasRapidas(
  params: FetchRespostasRapidasParams = {},
): Promise<FetchRespostasRapidasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  const rows = await apiRequest<RespostaRapida[]>("/admin/quick-replies");
  const filtered = q
    ? rows.filter(
        (r) => r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
      )
    : rows;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

/** POST /admin/quick-replies */
export async function createRespostaRapida(
  payload: CreateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  return apiRequest<RespostaRapida>("/admin/quick-replies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PATCH /admin/quick-replies/:id */
export async function updateRespostaRapida(
  payload: UpdateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  const { id, ...body } = payload;
  return apiRequest<RespostaRapida>(`/admin/quick-replies/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** DELETE /admin/quick-replies/:id */
export async function deleteRespostaRapida(
  payload: DeleteRespostaRapidaPayload,
): Promise<{ id: string }> {
  await apiRequest<{ deleted: boolean }>(
    `/admin/quick-replies/${encodeURIComponent(payload.id)}`,
    { method: "DELETE" },
  );
  return { id: payload.id };
}
