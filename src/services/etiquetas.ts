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

// Formato do backend (/admin/tags)
type TagDto = {
  id: string;
  name: string;
  color: string;
};

/** GET /admin/tags — lista completa; busca e paginação aplicadas aqui. */
export async function fetchEtiquetas(
  params: FetchEtiquetasParams = {},
): Promise<FetchEtiquetasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  const rows = await apiRequest<TagDto[]>("/admin/tags");
  const filtered = q ? rows.filter((t) => t.name.toLowerCase().includes(q)) : rows;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function listEtiquetas(): Promise<Etiqueta[]> {
  const res = await fetchEtiquetas({ page: 1, pageSize: 100 });
  return res.items;
}

/** POST /admin/tags */
export async function createEtiqueta(payload: CreateEtiquetaPayload): Promise<Etiqueta> {
  return apiRequest<Etiqueta>("/admin/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PATCH /admin/tags/:id */
export async function updateEtiqueta(payload: UpdateEtiquetaPayload): Promise<Etiqueta> {
  const { id, ...body } = payload;
  return apiRequest<Etiqueta>(`/admin/tags/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** DELETE /admin/tags/:id */
export async function deleteEtiqueta(
  payload: DeleteEtiquetaPayload,
): Promise<{ id: string }> {
  await apiRequest<{ deleted: boolean }>(`/admin/tags/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
  return { id: payload.id };
}
