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

export function connectionLabel(id: string) {
  return EQUIPE_CONNECTIONS.find((c) => c.id === id)?.label || id || "—";
}

export function profileLabel(id: string) {
  return EQUIPE_PROFILES.find((p) => p.id === id)?.label || id || "—";
}

export async function fetchEquipe(
  params: FetchEquipeParams = {},
): Promise<FetchEquipeResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchEquipeResult>(`/equipe?${search}`);
}

export async function createEquipeMember(
  payload: CreateEquipePayload,
): Promise<EquipeMember> {
  return apiRequest<EquipeMember>("/equipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEquipeMember(
  payload: UpdateEquipePayload,
): Promise<EquipeMember> {
  const { id, ...body } = payload;
  return apiRequest<EquipeMember>(`/equipe/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteEquipeMember(
  payload: DeleteEquipePayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/equipe/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
}
