import { API_BASE, apiRequest } from "@/services/api.ts";

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

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** GET — mocks `/departamentos`; API `/admin/departments`. */
export async function fetchDepartamentos(
  params: FetchDepartamentosParams = {},
): Promise<FetchDepartamentosResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  if (!API_BASE) {
    return apiRequest<FetchDepartamentosResult>(
      `/departamentos${qs({ page, pageSize, q: params.query })}`,
    );
  }

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

export async function listDepartamentos(): Promise<Departamento[]> {
  const res = await fetchDepartamentos({ page: 1, pageSize: 100 });
  return res.items;
}

export async function createDepartamento(
  payload: CreateDepartamentoPayload,
): Promise<Departamento> {
  if (!API_BASE) {
    return apiRequest<Departamento>("/departamentos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
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

export async function updateDepartamento(
  payload: UpdateDepartamentoPayload,
): Promise<Departamento> {
  if (!API_BASE) {
    const { id, ...body } = payload;
    return apiRequest<Departamento>(`/departamentos/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
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

export async function deleteDepartamento(
  payload: DeleteDepartamentoPayload,
): Promise<{ id: string }> {
  if (!API_BASE) {
    return apiRequest<{ id: string }>(
      `/departamentos/${encodeURIComponent(payload.id)}`,
      { method: "DELETE" },
    );
  }
  await apiRequest<{ deleted: boolean }>(
    `/admin/departments/${encodeURIComponent(payload.id)}`,
    { method: "DELETE" },
  );
  return { id: payload.id };
}
