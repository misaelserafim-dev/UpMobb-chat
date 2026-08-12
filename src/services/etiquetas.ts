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

const SEED: Etiqueta[] = [
  { id: "vip", name: "VIP", color: "#ef4444" },
  { id: "suporte", name: "Suporte", color: "#8b5cf6" },
  { id: "consultor", name: "Consultor", color: "#0063a3" },
  { id: "vendas", name: "Vendas", color: "#dc2626" },
  { id: "financeiro", name: "Financeiro", color: "#ca8a04" },
  { id: "prioridade", name: "Prioridade", color: "#ea580c" },
  { id: "parceiro", name: "Parceiro", color: "#0d9488" },
  { id: "lead", name: "Lead", color: "#2563eb" },
  { id: "inativo", name: "Inativo", color: "#6b7280" },
  { id: "onboarding", name: "Onboarding", color: "#7c3aed" },
  { id: "churn", name: "Risco de churn", color: "#b91c1c" },
  { id: "nps", name: "NPS alto", color: "#16a34a" },
  { id: "trial", name: "Trial", color: "#0891b2" },
  { id: "enterprise", name: "Enterprise", color: "#1e3a8a" },
  { id: "revenda", name: "Revenda", color: "#9333ea" },
  { id: "interno", name: "Interno", color: "#374151" },
];

let etiquetas = SEED.map((e) => ({ ...e }));

/** Lista síncrona pra selects (ex.: formulário de Contatos). */
export function listEtiquetas(): Etiqueta[] {
  return etiquetas.map((e) => ({ ...e }));
}

/**
 * Futuro: GET /etiquetas?page=&pageSize=&q=
 * Hoje: mock local paginado — a página só carrega quando a rota abre (lazy).
 */
export async function fetchEtiquetas(
  params: FetchEtiquetasParams = {},
): Promise<FetchEtiquetasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(420);

  const filtered = q
    ? etiquetas.filter(
        (e) => e.name.toLowerCase().includes(q) || e.color.toLowerCase().includes(q),
      )
    : etiquetas;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((e) => ({ ...e }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Futuro: POST /etiquetas  Body: { name, color } */
export async function createEtiqueta(payload: CreateEtiquetaPayload): Promise<Etiqueta> {
  await wait(280);
  const name = payload.name.trim();
  const color = payload.color.trim();
  const base = slugify(name) || "etiqueta";
  let id = base;
  let n = 1;
  while (etiquetas.some((e) => e.id === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  const created: Etiqueta = { id, name, color };
  etiquetas = [...etiquetas, created];
  return { ...created };
}

/** Futuro: PUT /etiquetas/:id  Body: { name, color } */
export async function updateEtiqueta(payload: UpdateEtiquetaPayload): Promise<Etiqueta> {
  await wait(280);
  const name = payload.name.trim();
  const color = payload.color.trim();
  const current = etiquetas.find((e) => e.id === payload.id);
  if (!current) {
    throw new Error("Etiqueta não encontrada");
  }
  const next: Etiqueta = { ...current, name, color };
  etiquetas = etiquetas.map((e) => (e.id === payload.id ? next : e));
  return { ...next };
}

/** Futuro: DELETE /etiquetas/:id */
export async function deleteEtiqueta(payload: DeleteEtiquetaPayload): Promise<{ id: string }> {
  await wait(280);
  etiquetas = etiquetas.filter((e) => e.id !== payload.id);
  return { id: payload.id };
}
