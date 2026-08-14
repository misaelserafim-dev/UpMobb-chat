export type FlowKind = "entry" | "page" | "component" | "service" | "data" | "action";

export type FlowNode = {
  id: string;
  label: string;
  file?: string;
  kind: FlowKind;
  call?: string;
};

export type FlowPath = {
  id: string;
  title: string;
  summary: string;
  nodes: FlowNode[];
};

export const FLOW_PATHS: FlowPath[] = [
  {
    id: "boot",
    title: "Boot",
    summary: "App sobe e monta o shell.",
    nodes: [
      { id: "main", label: "main.tsx", file: "src/main.tsx", kind: "entry" },
      { id: "auth", label: "AuthProvider", file: "src/context/AuthContext.tsx", kind: "entry", call: "envolve" },
      { id: "routes", label: "AppRoutes", file: "src/routes/index.tsx", kind: "entry", call: "lazy routes" },
    ],
  },
  {
    id: "login",
    title: "Login",
    summary: "Usuário autentica e vai para a Home.",
    nodes: [
      { id: "login-ui", label: "Login", file: "src/pages/Login/Login.tsx", kind: "page" },
      {
        id: "login-svc",
        label: "login()",
        file: "src/services/auth.ts",
        kind: "service",
        call: "POST auth",
      },
      {
        id: "session",
        label: "setSession()",
        file: "src/context/AuthContext.tsx",
        kind: "action",
        call: "grava user",
      },
      {
        id: "go-home",
        label: "navigate(/)",
        kind: "action",
        call: "abre Home",
      },
    ],
  },
  {
    id: "home-list",
    title: "Home · lista de chats",
    summary: "Home monta o layout e busca as conversas.",
    nodes: [
      { id: "home", label: "Home", file: "src/pages/Home/Home.tsx", kind: "page" },
      {
        id: "fetch-chats",
        label: "fetchChats()",
        file: "src/services/chats.ts",
        kind: "service",
        call: "GET /chats",
      },
      {
        id: "mock-or-api",
        label: "data/chats ou API",
        file: "src/data/chats.ts",
        kind: "data",
        call: "responde JSON",
      },
      {
        id: "chat-list",
        label: "ChatList",
        file: "src/componentes/ChatList/ChatList.tsx",
        kind: "component",
        call: "renderiza",
      },
      {
        id: "chat-item",
        label: "ChatItem",
        file: "src/componentes/ChatItem/ChatItem.tsx",
        kind: "component",
        call: "cada conversa",
      },
    ],
  },
  {
    id: "open-chat",
    title: "Abrir conversa",
    summary: "Clique no item → busca mensagens → abre a janela.",
    nodes: [
      {
        id: "click-item",
        label: "ChatItem click",
        file: "src/componentes/ChatItem/ChatItem.tsx",
        kind: "component",
      },
      {
        id: "select",
        label: "selectChat()",
        file: "src/pages/Home/Home.tsx",
        kind: "action",
        call: "estado + loading",
      },
      {
        id: "fetch-msgs",
        label: "fetchChatMessages()",
        file: "src/services/chats.ts",
        kind: "service",
        call: "GET /chats/:id/messages",
      },
      {
        id: "chat-window",
        label: "ChatWindow",
        file: "src/componentes/ChatWindow/ChatWindow.tsx",
        kind: "component",
        call: "mostra bolhas",
      },
    ],
  },
  {
    id: "send",
    title: "Enviar mensagem",
    summary: "Composer monta payload e manda pelo service.",
    nodes: [
      {
        id: "input",
        label: "ChatInput",
        file: "src/componentes/ChatInput/ChatInput.tsx",
        kind: "component",
      },
      {
        id: "on-send",
        label: "onSend()",
        file: "src/pages/Home/Home.tsx",
        kind: "action",
        call: "sobe payload",
      },
      {
        id: "send-svc",
        label: "sendChatMessage()",
        file: "src/services/chats.ts",
        kind: "service",
        call: "POST /messages",
      },
      {
        id: "bubble",
        label: "MessageBubble",
        file: "src/componentes/MessageBubble/MessageBubble.tsx",
        kind: "component",
        call: "aparece na lista",
      },
    ],
  },
  {
    id: "new-ticket",
    title: "Novo ticket",
    summary: "Modal cria atendimento e abre a conversa.",
    nodes: [
      {
        id: "modal",
        label: "NewTicketModal",
        file: "src/componentes/NewTicketModal/NewTicketModal.tsx",
        kind: "component",
      },
      {
        id: "create",
        label: "createChat()",
        file: "src/services/chats.ts",
        kind: "service",
        call: "POST /chats",
      },
      {
        id: "open",
        label: "selectChat(id)",
        file: "src/pages/Home/Home.tsx",
        kind: "action",
        call: "abre conversa",
      },
    ],
  },
  {
    id: "internas",
    title: "Páginas internas",
    summary: "Cada página chama o próprio service (CRUD).",
    nodes: [
      {
        id: "internas-tpl",
        label: "InternasTemplate",
        file: "src/templates/Internas/InternasTemplate.tsx",
        kind: "page",
      },
      {
        id: "page-crud",
        label: "Contatos / Etiquetas / …",
        kind: "page",
        call: "CRUD na UI",
      },
      {
        id: "svc-crud",
        label: "services/*",
        file: "src/services/",
        kind: "service",
        call: "apiRequest",
      },
      {
        id: "data-crud",
        label: "data/* (mock)",
        file: "src/data/",
        kind: "data",
        call: "até ter API",
      },
    ],
  },
];

export const FLOW_KIND_LABEL: Record<FlowKind, string> = {
  entry: "boot",
  page: "page",
  component: "ui",
  service: "service",
  data: "mock/api",
  action: "fluxo",
};
