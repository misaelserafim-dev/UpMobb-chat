import type {
  CreateRespostaRapidaPayload,
  FetchRespostasRapidasResult,
  RespostaRapida,
  UpdateRespostaRapidaPayload,
} from "@/services/respostasRapidas.ts";

const SEED: RespostaRapida[] = [
  {
    id: "rr-ola",
    shortcut: "ola",
    text: "Olá! Seja bem-vindo(a) ao atendimento UpMobb. Como posso ajudar?",
  },
  {
    id: "rr-aguarde",
    shortcut: "aguarde",
    text: "Só um momento, por favor. Já retorno com a informação.",
  },
  {
    id: "rr-horario",
    shortcut: "horario",
    text: "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
  },
  {
    id: "rr-obrigado",
    shortcut: "obrigado",
    text: "Obrigado pelo contato! Qualquer dúvida, estamos à disposição.",
  },
  {
    id: "rr-protocolo",
    shortcut: "protocolo",
    text: "Pode me informar o número do protocolo, por favor?",
  },
  {
    id: "rr-encerrar",
    shortcut: "encerrar",
    text: "Vou encerrar este atendimento. Se precisar, é só chamar novamente.",
  },
];

let respostas = SEED.map((r) => ({ ...r }));

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(shortcut: string) {
  const base = slugify(shortcut) || "resposta";
  let id = `rr-${base}`;
  let n = 1;
  while (respostas.some((r) => r.id === id)) {
    n += 1;
    id = `rr-${base}-${n}`;
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

export async function mockRespostasRapidasRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/respostas-rapidas") {
    const limitRaw = search.get("limit");
    if (limitRaw != null) {
      const q = (search.get("q") || "").trim().toLowerCase();
      const limit = Math.min(20, Math.max(1, Number(limitRaw) || 8));
      const list = q
        ? respostas.filter((r) => r.shortcut.toLowerCase().includes(q))
        : respostas;
      return list.slice(0, limit).map((r) => ({ ...r }));
    }

    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = q
      ? respostas.filter(
          (r) =>
            r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
        )
      : respostas;

    const start = (page - 1) * pageSize;
    const result: FetchRespostasRapidasResult = {
      items: filtered.slice(start, start + pageSize).map((r) => ({ ...r })),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/respostas-rapidas") {
    const payload = body as CreateRespostaRapidaPayload;
    const created: RespostaRapida = {
      id: uniqueId(payload.shortcut),
      shortcut: payload.shortcut.trim(),
      text: payload.text.trim(),
    };
    respostas = [...respostas, created];
    return { ...created };
  }

  const match = pathname.match(/^\/respostas-rapidas\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateRespostaRapidaPayload, "id">;
      const current = respostas.find((r) => r.id === id);
      if (!current) throw new Error("Resposta rápida não encontrada");

      const next: RespostaRapida = {
        ...current,
        shortcut: payload.shortcut.trim(),
        text: payload.text.trim(),
      };
      respostas = respostas.map((r) => (r.id === id ? next : r));
      return { ...next };
    }

    if (m === "DELETE") {
      respostas = respostas.filter((r) => r.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
