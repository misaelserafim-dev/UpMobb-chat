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

export async function filterRespostasRapidas(
  params: { query?: string; limit?: number } = {},
): Promise<RespostaRapida[]> {
  const q = (params.query || "").trim();
  const limit = Math.min(20, Math.max(1, params.limit || 8));

  const search = new URLSearchParams({
    limit: String(limit),
  });
  if (q) search.set("q", q);

  return apiRequest<RespostaRapida[]>(`/respostas-rapidas?${search}`);
}

export async function fetchRespostasRapidas(
  params: FetchRespostasRapidasParams = {},
): Promise<FetchRespostasRapidasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchRespostasRapidasResult>(`/respostas-rapidas?${search}`);
}

export async function createRespostaRapida(
  payload: CreateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  return apiRequest<RespostaRapida>("/respostas-rapidas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRespostaRapida(
  payload: UpdateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  const { id, ...body } = payload;
  return apiRequest<RespostaRapida>(`/respostas-rapidas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteRespostaRapida(
  payload: DeleteRespostaRapidaPayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(
    `/respostas-rapidas/${encodeURIComponent(payload.id)}`,
    { method: "DELETE" },
  );
}
