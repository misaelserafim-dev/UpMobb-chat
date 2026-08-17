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

// Formato do backend (/admin/departments)
type DepartmentDto = {
  id: string;
  name: string;
  color: string;
  greetingMessage: string;
  sortOrder: number;
  active: boolean;
};

function toDepartamento(dto: DepartmentDto): Departamento {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
    greeting: dto.greetingMessage,
  };
}

/** GET /admin/departments — lista completa; busca e paginação aplicadas aqui. */
export async function fetchDepartamentos(
  params: FetchDepartamentosParams = {},
): Promise<FetchDepartamentosResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  const rows = await apiRequest<DepartmentDto[]>("/admin/departments");
  const all = rows.map(toDepartamento);
  const filtered = q ? all.filter((d) => d.name.toLowerCase().includes(q)) : all;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Lista completa pra selects (Equipe, Novo ticket). */
export async function listDepartamentos(): Promise<Departamento[]> {
  const res = await fetchDepartamentos({ page: 1, pageSize: 100 });
  return res.items;
}

/** POST /admin/departments */
export async function createDepartamento(
  payload: CreateDepartamentoPayload,
): Promise<Departamento> {
  const dto = await apiRequest<DepartmentDto>("/admin/departments", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      color: payload.color,
      greetingMessage: payload.greeting,
    }),
  });
  return toDepartamento(dto);
}

/** PATCH /admin/departments/:id */
export async function updateDepartamento(
  payload: UpdateDepartamentoPayload,
): Promise<Departamento> {
  const dto = await apiRequest<DepartmentDto>(
    `/admin/departments/${encodeURIComponent(payload.id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: payload.name,
        color: payload.color,
        greetingMessage: payload.greeting,
      }),
    },
  );
  return toDepartamento(dto);
}

/** DELETE /admin/departments/:id */
export async function deleteDepartamento(
  payload: DeleteDepartamentoPayload,
): Promise<{ id: string }> {
  await apiRequest<{ deleted: boolean }>(
    `/admin/departments/${encodeURIComponent(payload.id)}`,
    { method: "DELETE" },
  );
  return { id: payload.id };
}
