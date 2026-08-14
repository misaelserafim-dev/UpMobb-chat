import { apiRequest } from "@/services/api.ts";

export type Etiqueta = {
  id: string;
  name: string;
  color: string;
};

export type FetchEtiquetasParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchEtiquetasResult = {
  items: Etiqueta[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateEtiquetaPayload = {
  name: string;
  color: string;
};

export type UpdateEtiquetaPayload = {
  id: string;
  name: string;
  color: string;
};

export type DeleteEtiquetaPayload = {
  id: string;
};

export async function fetchEtiquetas(
  params: FetchEtiquetasParams = {},
): Promise<FetchEtiquetasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchEtiquetasResult>(`/etiquetas?${search}`);
}

export async function listEtiquetas(): Promise<Etiqueta[]> {
  const res = await fetchEtiquetas({ page: 1, pageSize: 100 });
  return res.items;
}

export async function createEtiqueta(payload: CreateEtiquetaPayload): Promise<Etiqueta> {
  return apiRequest<Etiqueta>("/etiquetas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEtiqueta(payload: UpdateEtiquetaPayload): Promise<Etiqueta> {
  const { id, ...body } = payload;
  return apiRequest<Etiqueta>(`/etiquetas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteEtiqueta(
  payload: DeleteEtiquetaPayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/etiquetas/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
}
