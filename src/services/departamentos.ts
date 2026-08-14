import { apiRequest } from "@/services/api.ts";

export type Departamento = {
  id: string;
  name: string;
  color: string;
  greeting: string;
};

export type FetchDepartamentosParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchDepartamentosResult = {
  items: Departamento[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateDepartamentoPayload = {
  name: string;
  color: string;
  greeting: string;
};

export type UpdateDepartamentoPayload = {
  id: string;
  name: string;
  color: string;
  greeting: string;
};

export type DeleteDepartamentoPayload = {
  id: string;
};

/** GET /departamentos?page=&pageSize=&q= */
export async function fetchDepartamentos(
  params: FetchDepartamentosParams = {},
): Promise<FetchDepartamentosResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchDepartamentosResult>(`/departamentos?${search}`);
}

/** Lista completa pra selects (Equipe, Novo ticket). */
export async function listDepartamentos(): Promise<Departamento[]> {
  const res = await fetchDepartamentos({ page: 1, pageSize: 100 });
  return res.items;
}

/** POST /departamentos */
export async function createDepartamento(
  payload: CreateDepartamentoPayload,
): Promise<Departamento> {
  return apiRequest<Departamento>("/departamentos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PUT /departamentos/:id */
export async function updateDepartamento(
  payload: UpdateDepartamentoPayload,
): Promise<Departamento> {
  const { id, ...body } = payload;
  return apiRequest<Departamento>(`/departamentos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** DELETE /departamentos/:id */
export async function deleteDepartamento(
  payload: DeleteDepartamentoPayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/departamentos/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
}
