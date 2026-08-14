import type {
  CreateEtiquetaPayload,
  Etiqueta,
  FetchEtiquetasResult,
  UpdateEtiquetaPayload,
} from "@/services/etiquetas.ts";

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

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(name: string) {
  const base = slugify(name) || "etiqueta";
  let id = base;
  let n = 1;
  while (etiquetas.some((e) => e.id === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

function matchesQuery(e: Etiqueta, q: string) {
  if (!q) return true;
  return e.name.toLowerCase().includes(q) || e.color.toLowerCase().includes(q);
}

export async function mockEtiquetasRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/etiquetas") {
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = etiquetas.filter((e) => matchesQuery(e, q));
    const start = (page - 1) * pageSize;
    const result: FetchEtiquetasResult = {
      items: filtered.slice(start, start + pageSize).map((e) => ({ ...e })),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/etiquetas") {
    const payload = body as CreateEtiquetaPayload;
    const created: Etiqueta = {
      id: uniqueId(payload.name),
      name: payload.name.trim(),
      color: payload.color.trim(),
    };
    etiquetas = [...etiquetas, created];
    return { ...created };
  }

  const match = pathname.match(/^\/etiquetas\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateEtiquetaPayload, "id">;
      const current = etiquetas.find((e) => e.id === id);
      if (!current) throw new Error("Etiqueta não encontrada");

      const next: Etiqueta = {
        ...current,
        name: payload.name.trim(),
        color: payload.color.trim(),
      };
      etiquetas = etiquetas.map((e) => (e.id === id ? next : e));
      return { ...next };
    }

    if (m === "DELETE") {
      etiquetas = etiquetas.filter((e) => e.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
