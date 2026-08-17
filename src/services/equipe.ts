import { apiRequest } from "@/services/api.ts";

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

/**
 * Preenchido com as conexões reais do backend em fetchEquipe().
 * Array mutável de propósito: a tela Equipe importa a constante direto.
 */
export const EQUIPE_CONNECTIONS: EquipeConnectionOption[] = [];

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

export function connectionLabel(id: string) {
  return EQUIPE_CONNECTIONS.find((c) => c.id === id)?.label || id || "—";
}

export function profileLabel(id: string) {
  return EQUIPE_PROFILES.find((p) => p.id === id)?.label || id || "—";
}

// Formato do backend (/admin/teams)
type TeamDto = {
  id: string;
  name: string;
  email: string;
  role: EquipeProfileId;
  active: boolean;
  departmentIds: string[];
  connectionIds: string[];
};

type ConnectionDto = {
  id: string;
  name: string;
};

function toEquipeMember(dto: TeamDto): EquipeMember {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    connectionId: dto.connectionIds[0] || "",
    profile: dto.role,
    status: dto.active ? "online" : "offline",
    departamentoIds: dto.departmentIds,
    // Permissões ainda não existem no backend; ficam locais na tela
    permissions: emptyEquipePermissions(),
  };
}

async function refreshConnections() {
  const rows = await apiRequest<ConnectionDto[]>("/panel/connections");
  EQUIPE_CONNECTIONS.splice(
    0,
    EQUIPE_CONNECTIONS.length,
    ...rows.map((c) => ({ id: c.id, label: c.name })),
  );
}

/** GET /admin/teams — lista completa; busca e paginação aplicadas aqui. */
export async function fetchEquipe(
  params: FetchEquipeParams = {},
): Promise<FetchEquipeResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  const [rows] = await Promise.all([apiRequest<TeamDto[]>("/admin/teams"), refreshConnections()]);
  const all = rows.map(toEquipeMember);
  const filtered = q
    ? all.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    : all;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

/** POST /admin/teams */
export async function createEquipeMember(
  payload: CreateEquipePayload,
): Promise<EquipeMember> {
  const dto = await apiRequest<TeamDto>("/admin/teams", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.profile,
      departmentIds: payload.departamentoIds,
      connectionIds: payload.connectionId ? [payload.connectionId] : [],
    }),
  });
  return toEquipeMember(dto);
}

/** PATCH /admin/teams/:id */
export async function updateEquipeMember(
  payload: UpdateEquipePayload,
): Promise<EquipeMember> {
  const body: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    role: payload.profile,
    departmentIds: payload.departamentoIds,
    connectionIds: payload.connectionId ? [payload.connectionId] : [],
  };
  if (payload.password) body.password = payload.password;

  const dto = await apiRequest<TeamDto>(`/admin/teams/${encodeURIComponent(payload.id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return toEquipeMember(dto);
}

/** DELETE /admin/teams/:id */
export async function deleteEquipeMember(
  payload: DeleteEquipePayload,
): Promise<{ id: string }> {
  await apiRequest<{ deleted: boolean }>(`/admin/teams/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
  return { id: payload.id };
}
