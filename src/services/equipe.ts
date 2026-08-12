export type EquipeProfileId = "user" | "admin";
export type EquipeStatus = "online" | "offline";

export type EquipePermissionId =
  | "historico"
  | "ver-tickets"
  | "tickets-sem-atribuicao"
  | "espiar"
  | "assinar"
  | "retornar"
  | "ver-grupos";

export type EquipePermissions = Record<EquipePermissionId, boolean>;

export type EquipeMember = {
  id: string;
  name: string;
  email: string;
  connectionId: string;
  profile: EquipeProfileId;
  status: EquipeStatus;
  departamentoIds: string[];
  permissions: EquipePermissions;
};

export type EquipeConnectionOption = {
  id: string;
  label: string;
};

export type EquipeProfileOption = {
  id: EquipeProfileId;
  label: string;
};

export type EquipePermissionMeta = {
  id: EquipePermissionId;
  title: string;
  description: string;
  icon: "history" | "messages" | "ticketOff" | "eye" | "edit" | "reply" | "users";
};

export type FetchEquipeParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchEquipeResult = {
  items: EquipeMember[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateEquipePayload = {
  name: string;
  email: string;
  password: string;
  connectionId: string;
  profile: EquipeProfileId;
  departamentoIds: string[];
  permissions: EquipePermissions;
};

export type UpdateEquipePayload = {
  id: string;
  name: string;
  email: string;
  password?: string;
  connectionId: string;
  profile: EquipeProfileId;
  departamentoIds: string[];
  permissions: EquipePermissions;
};

export type DeleteEquipePayload = {
  id: string;
};

export const EQUIPE_CONNECTIONS: EquipeConnectionOption[] = [
  { id: "qrcode-suporte", label: "QRCode - Suporte Plugin" },
  { id: "comercial-upmobb", label: "Comercial UpMobb" },
];

export const EQUIPE_PROFILES: EquipeProfileOption[] = [
  { id: "user", label: "User" },
  { id: "admin", label: "Admin" },
];

export const EQUIPE_PERMISSIONS: EquipePermissionMeta[] = [
  {
    id: "historico",
    title: "Histórico de conversas",
    description: "O usuário pode ver todo o histórico de conversas com o contato.",
    icon: "history",
  },
  {
    id: "ver-tickets",
    title: "Ver todos os tickets",
    description:
      "O usuário pode ver todos os Tickets, inclusive os que não estão atribuídos à ele.",
    icon: "messages",
  },
  {
    id: "tickets-sem-atribuicao",
    title: "Tickets sem atribuições",
    description:
      "O usuário pode ver Tickets de contatos que ainda estão sem departamentos e sem usuários atribuídos.",
    icon: "ticketOff",
  },
  {
    id: "espiar",
    title: "Espiar mensagens",
    description: "O usuário pode espiar mensagens sem ter que entrar em um Ticket.",
    icon: "eye",
  },
  {
    id: "assinar",
    title: "Sempre assinar mensagens",
    description:
      "Se ativado, o nome do usuário será sempre assinado. Se desativado, a assinatura será opcional ao usuário.",
    icon: "edit",
  },
  {
    id: "retornar",
    title: "Retornar Tickets",
    description: "O usuário pode retornar Tickets para o Aguardando.",
    icon: "reply",
  },
  {
    id: "ver-grupos",
    title: "Ver grupos",
    description: "O usuário pode visualizar e interagir em grupos.",
    icon: "users",
  },
];

export function emptyEquipePermissions(): EquipePermissions {
  return Object.fromEntries(
    EQUIPE_PERMISSIONS.map((p) => [p.id, false]),
  ) as EquipePermissions;
}

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

const SEED: EquipeMember[] = [
  {
    id: "eq-nicoly",
    name: "Nicoly",
    email: "nicoly@upmobb.tech",
    connectionId: "comercial-upmobb",
    profile: "admin",
    status: "online",
    departamentoIds: ["dept-comercial", "dept-suporte"],
    permissions: {
      ...emptyEquipePermissions(),
      historico: true,
      "ver-tickets": true,
      retornar: true,
    },
  },
  {
    id: "eq-carlos",
    name: "Carlos",
    email: "carlos@upmobb.tech",
    connectionId: "qrcode-suporte",
    profile: "user",
    status: "offline",
    departamentoIds: ["dept-suporte"],
    permissions: {
      ...emptyEquipePermissions(),
      historico: true,
      espiar: true,
    },
  },
  {
    id: "eq-ana",
    name: "Ana Paula",
    email: "ana@upmobb.tech",
    connectionId: "comercial-upmobb",
    profile: "user",
    status: "online",
    departamentoIds: ["dept-comercial"],
    permissions: {
      ...emptyEquipePermissions(),
      assinar: true,
      "ver-grupos": true,
    },
  },
];

let membros = SEED.map((m) => ({
  ...m,
  departamentoIds: [...m.departamentoIds],
  permissions: { ...m.permissions },
}));

/**
 * Futuro: GET /equipe?page=&pageSize=&q=
 * Hoje: mock local paginado — a página só carrega quando a rota abre (lazy).
 */
export async function fetchEquipe(
  params: FetchEquipeParams = {},
): Promise<FetchEquipeResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(420);

  const filtered = q
    ? membros.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.profile.toLowerCase().includes(q),
      )
    : membros;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((m) => ({
    ...m,
    departamentoIds: [...m.departamentoIds],
    permissions: { ...m.permissions },
  }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Futuro: POST /equipe  Body: CreateEquipePayload */
export async function createEquipeMember(
  payload: CreateEquipePayload,
): Promise<EquipeMember> {
  await wait(280);
  const name = payload.name.trim();
  const email = payload.email.trim();
  const base = slugify(name) || "membro";
  let id = `eq-${base}`;
  let n = 1;
  while (membros.some((m) => m.id === id)) {
    n += 1;
    id = `eq-${base}-${n}`;
  }

  const created: EquipeMember = {
    id,
    name,
    email,
    connectionId: payload.connectionId,
    profile: payload.profile,
    status: "offline",
    departamentoIds: [...payload.departamentoIds],
    permissions: { ...emptyEquipePermissions(), ...payload.permissions },
  };
  membros = [...membros, created];
  return {
    ...created,
    departamentoIds: [...created.departamentoIds],
    permissions: { ...created.permissions },
  };
}

/** Futuro: PUT /equipe/:id  Body: UpdateEquipePayload */
export async function updateEquipeMember(
  payload: UpdateEquipePayload,
): Promise<EquipeMember> {
  await wait(280);
  const current = membros.find((m) => m.id === payload.id);
  if (!current) {
    throw new Error("Membro não encontrado");
  }

  const next: EquipeMember = {
    ...current,
    name: payload.name.trim(),
    email: payload.email.trim(),
    connectionId: payload.connectionId,
    profile: payload.profile,
    departamentoIds: [...payload.departamentoIds],
    permissions: { ...emptyEquipePermissions(), ...payload.permissions },
  };
  membros = membros.map((m) => (m.id === payload.id ? next : m));
  return {
    ...next,
    departamentoIds: [...next.departamentoIds],
    permissions: { ...next.permissions },
  };
}

/** Futuro: DELETE /equipe/:id */
export async function deleteEquipeMember(
  payload: DeleteEquipePayload,
): Promise<{ id: string }> {
  await wait(280);
  membros = membros.filter((m) => m.id !== payload.id);
  return { id: payload.id };
}

export function connectionLabel(id: string) {
  return EQUIPE_CONNECTIONS.find((c) => c.id === id)?.label || id || "—";
}

export function profileLabel(id: string) {
  return EQUIPE_PROFILES.find((p) => p.id === id)?.label || id || "—";
}
