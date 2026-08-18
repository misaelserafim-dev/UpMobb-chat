import { API_BASE, apiRequest } from "@/services/api.ts";

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

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** GET — mocks `/etiquetas`; API `/admin/tags`. */
export async function fetchEtiquetas(
  params: FetchEtiquetasParams = {},
): Promise<FetchEtiquetasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  if (!API_BASE) {
    return apiRequest<FetchEtiquetasResult>(
      `/etiquetas${qs({ page, pageSize, q: params.query })}`,
    );
  }

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

export async function createEtiqueta(payload: CreateEtiquetaPayload): Promise<Etiqueta> {
  if (!API_BASE) {
    return apiRequest<Etiqueta>("/etiquetas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  return apiRequest<Etiqueta>("/admin/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEtiqueta(payload: UpdateEtiquetaPayload): Promise<Etiqueta> {
  const { id, ...body } = payload;
  if (!API_BASE) {
    return apiRequest<Etiqueta>(`/etiquetas/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
  return apiRequest<Etiqueta>(`/admin/tags/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteEtiqueta(
  payload: DeleteEtiquetaPayload,
): Promise<{ id: string }> {
  if (!API_BASE) {
    return apiRequest<{ id: string }>(`/etiquetas/${encodeURIComponent(payload.id)}`, {
      method: "DELETE",
    });
  }
  await apiRequest<{ deleted: boolean }>(`/admin/tags/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
  return { id: payload.id };
}
