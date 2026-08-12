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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SEED: Departamento[] = [
  {
    id: "dept-modulacao",
    name: "Alterações e Criações de Modulação",
    color: "#166534",
    greeting: "Você está no setor de alteração e criação de modulação.",
  },
  {
    id: "dept-comercial",
    name: "Comercial",
    color: "#1d4ed8",
    greeting: "Olá! Somos o comercial do UpMobb! me diga como posso ajudar.",
  },
  {
    id: "dept-financeiro",
    name: "Financeiro",
    color: "#ca8a04",
    greeting: "Para prosseguirmos com o seu atendimento financeiro, informe o protocolo.",
  },
  {
    id: "dept-suporte",
    name: "Suporte técnico",
    color: "#0369a1",
    greeting: "Você selecionou o suporte técnico. Conte o que está acontecendo.",
  },
  {
    id: "dept-treinamento",
    name: "Treinamento",
    color: "#65a30d",
    greeting: "Você está no setor de Treinamentos da UpMobb.",
  },
  {
    id: "dept-sucesso",
    name: "Sucesso do cliente",
    color: "#7c3aed",
    greeting: "Bem-vindo ao Sucesso do Cliente. Como podemos ajudar na sua jornada?",
  },
  {
    id: "dept-implantacao",
    name: "Implantação",
    color: "#0f766e",
    greeting: "Você está no time de Implantação. Vamos configurar seu ambiente juntos.",
  },
  {
    id: "dept-juridico",
    name: "Jurídico",
    color: "#44403c",
    greeting: "Setor jurídico. Descreva sua solicitação com o máximo de detalhes.",
  },
];

let departamentos = SEED.map((d) => ({ ...d }));

/** Lista síncrona pra selects (ex.: formulário de Equipe). */
export function listDepartamentos(): Departamento[] {
  return departamentos.map((d) => ({ ...d }));
}

/**
 * Futuro: GET /departamentos?page=&pageSize=&q=
 * Hoje: mock local paginado — a página só carrega quando a rota abre (lazy).
 */
export async function fetchDepartamentos(
  params: FetchDepartamentosParams = {},
): Promise<FetchDepartamentosResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(420);

  const filtered = q
    ? departamentos.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.greeting.toLowerCase().includes(q) ||
          d.color.toLowerCase().includes(q),
      )
    : departamentos;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((d) => ({ ...d }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Futuro: POST /departamentos  Body: { name, color, greeting } */
export async function createDepartamento(
  payload: CreateDepartamentoPayload,
): Promise<Departamento> {
  await wait(280);
  const name = payload.name.trim();
  const color = payload.color.trim();
  const greeting = payload.greeting.trim();
  const base = slugify(name) || "departamento";
  let id = `dept-${base}`;
  let n = 1;
  while (departamentos.some((d) => d.id === id)) {
    n += 1;
    id = `dept-${base}-${n}`;
  }
  const created: Departamento = { id, name, color, greeting };
  departamentos = [...departamentos, created];
  return { ...created };
}

/** Futuro: PUT /departamentos/:id  Body: { name, color, greeting } */
export async function updateDepartamento(
  payload: UpdateDepartamentoPayload,
): Promise<Departamento> {
  await wait(280);
  const current = departamentos.find((d) => d.id === payload.id);
  if (!current) {
    throw new Error("Departamento não encontrado");
  }
  const next: Departamento = {
    ...current,
    name: payload.name.trim(),
    color: payload.color.trim(),
    greeting: payload.greeting.trim(),
  };
  departamentos = departamentos.map((d) => (d.id === payload.id ? next : d));
  return { ...next };
}

/** Futuro: DELETE /departamentos/:id */
export async function deleteDepartamento(
  payload: DeleteDepartamentoPayload,
): Promise<{ id: string }> {
  await wait(280);
  departamentos = departamentos.filter((d) => d.id !== payload.id);
  return { id: payload.id };
}
