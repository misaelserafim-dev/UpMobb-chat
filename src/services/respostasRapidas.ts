import { API_BASE, apiRequest } from "@/services/api.ts";

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

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** Autocomplete do composer. */
export async function filterRespostasRapidas(
  params: { query?: string; limit?: number } = {},
): Promise<RespostaRapida[]> {
  const limit = Math.min(20, Math.max(1, params.limit || 8));

  if (!API_BASE) {
    return apiRequest<RespostaRapida[]>(
      `/respostas-rapidas${qs({ q: params.query, limit })}`,
    );
  }

  const q = (params.query || "").trim().toLowerCase();
  const rows = await apiRequest<RespostaRapida[]>("/panel/quick-replies");
  const filtered = q
    ? rows.filter(
        (r) => r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
      )
    : rows;
  return filtered.slice(0, limit);
}

/** GET — mocks `/respostas-rapidas`; API `/admin/quick-replies`. */
export async function fetchRespostasRapidas(
  params: FetchRespostasRapidasParams = {},
): Promise<FetchRespostasRapidasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  if (!API_BASE) {
    return apiRequest<FetchRespostasRapidasResult>(
      `/respostas-rapidas${qs({ page, pageSize, q: params.query })}`,
    );
  }

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

export async function createRespostaRapida(
  payload: CreateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  if (!API_BASE) {
    return apiRequest<RespostaRapida>("/respostas-rapidas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  return apiRequest<RespostaRapida>("/admin/quick-replies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRespostaRapida(
  payload: UpdateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  const { id, ...body } = payload;
  if (!API_BASE) {
    return apiRequest<RespostaRapida>(`/respostas-rapidas/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
  return apiRequest<RespostaRapida>(`/admin/quick-replies/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteRespostaRapida(
  payload: DeleteRespostaRapidaPayload,
): Promise<{ id: string }> {
  if (!API_BASE) {
    return apiRequest<{ id: string }>(
      `/respostas-rapidas/${encodeURIComponent(payload.id)}`,
      { method: "DELETE" },
    );
  }
  await apiRequest<{ deleted: boolean }>(
    `/admin/quick-replies/${encodeURIComponent(payload.id)}`,
    { method: "DELETE" },
  );
  return { id: payload.id };
}
