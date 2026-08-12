export const EQUIPE_CONNECTIONS = [
  { id: "qrcode-suporte", label: "QRCode - Suporte Plugin" },
  { id: "comercial-upmobb", label: "Comercial UpMobb" },
];

export const EQUIPE_PROFILES = [
  { id: "user", label: "User" },
  { id: "admin", label: "Admin" },
];

export const EQUIPE_PERMISSIONS = [
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

export function emptyEquipePermissions() {
  return Object.fromEntries(EQUIPE_PERMISSIONS.map((p) => [p.id, false]));
}

export const equipes = [
  {
    id: "eq-nicoly",
    name: "Nicoly",
    email: "nicoly@upmobb.tech",
    password: "demo123",
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
    password: "demo123",
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
];
