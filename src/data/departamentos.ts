import type {
  CreateDepartamentoPayload,
  Departamento,
  FetchDepartamentosResult,
  UpdateDepartamentoPayload,
} from "@/services/departamentos.ts";

/**
 * Mock de departamentos — só sem VITE_API_URL.
 * Delete `src/data` ao plugar o backend.
 */

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

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

export async function mockDepartamentosRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/departamentos") {
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = q
      ? departamentos.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.greeting.toLowerCase().includes(q) ||
            d.color.toLowerCase().includes(q),
        )
      : departamentos;

    const start = (page - 1) * pageSize;
    const result: FetchDepartamentosResult = {
      items: filtered.slice(start, start + pageSize).map((d) => ({ ...d })),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/departamentos") {
    const payload = body as CreateDepartamentoPayload;
    const name = payload.name.trim();
    const base = slugify(name) || "departamento";
    let id = `dept-${base}`;
    let n = 1;
    while (departamentos.some((d) => d.id === id)) {
      n += 1;
      id = `dept-${base}-${n}`;
    }

    const created: Departamento = {
      id,
      name,
      color: payload.color.trim(),
      greeting: payload.greeting.trim(),
    };
    departamentos = [...departamentos, created];
    return { ...created };
  }

  const match = pathname.match(/^\/departamentos\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateDepartamentoPayload, "id">;
      const current = departamentos.find((d) => d.id === id);
      if (!current) throw new Error("Departamento não encontrado");

      const next: Departamento = {
        ...current,
        name: payload.name.trim(),
        color: payload.color.trim(),
        greeting: payload.greeting.trim(),
      };
      departamentos = departamentos.map((d) => (d.id === id ? next : d));
      return { ...next };
    }

    if (m === "DELETE") {
      departamentos = departamentos.filter((d) => d.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
