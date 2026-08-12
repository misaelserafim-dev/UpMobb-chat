export type RespostaRapida = {
  id: string;
  shortcut: string;
  text: string;
};

export type FetchRespostasRapidasParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchRespostasRapidasResult = {
  items: RespostaRapida[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateRespostaRapidaPayload = {
  shortcut: string;
  text: string;
};

export type UpdateRespostaRapidaPayload = {
  id: string;
  shortcut: string;
  text: string;
};

export type DeleteRespostaRapidaPayload = {
  id: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

/**
 * Futuro: GET /respostas-rapidas?q=&limit=
 * Composer `/` — filtro síncrono no mock (sem delay) pra UX de digitação.
 */
export function filterRespostasRapidas(
  params: { query?: string; limit?: number } = {},
): RespostaRapida[] {
  const q = (params.query || "").trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, params.limit || 8));
  const list = q
    ? respostas.filter((r) => r.shortcut.toLowerCase().includes(q))
    : respostas;
  return list.slice(0, limit).map((r) => ({ ...r }));
}

/**
 * Futuro: GET /respostas-rapidas?page=&pageSize=&q=
 * Hoje: mock local paginado — a página só carrega quando a rota abre (lazy).
 */
export async function fetchRespostasRapidas(
  params: FetchRespostasRapidasParams = {},
): Promise<FetchRespostasRapidasResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(420);

  const filtered = q
    ? respostas.filter(
        (r) =>
          r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
      )
    : respostas;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((r) => ({ ...r }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Futuro: POST /respostas-rapidas  Body: { shortcut, text } */
export async function createRespostaRapida(
  payload: CreateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  await wait(280);
  const shortcut = payload.shortcut.trim();
  const text = payload.text.trim();
  const base = slugify(shortcut) || "resposta";
  let id = `rr-${base}`;
  let n = 1;
  while (respostas.some((r) => r.id === id)) {
    n += 1;
    id = `rr-${base}-${n}`;
  }
  const created: RespostaRapida = { id, shortcut, text };
  respostas = [...respostas, created];
  return { ...created };
}

/** Futuro: PUT /respostas-rapidas/:id  Body: { shortcut, text } */
export async function updateRespostaRapida(
  payload: UpdateRespostaRapidaPayload,
): Promise<RespostaRapida> {
  await wait(280);
  const current = respostas.find((r) => r.id === payload.id);
  if (!current) {
    throw new Error("Resposta rápida não encontrada");
  }
  const next: RespostaRapida = {
    ...current,
    shortcut: payload.shortcut.trim(),
    text: payload.text.trim(),
  };
  respostas = respostas.map((r) => (r.id === payload.id ? next : r));
  return { ...next };
}

/** Futuro: DELETE /respostas-rapidas/:id */
export async function deleteRespostaRapida(
  payload: DeleteRespostaRapidaPayload,
): Promise<{ id: string }> {
  await wait(280);
  respostas = respostas.filter((r) => r.id !== payload.id);
  return { id: payload.id };
}
