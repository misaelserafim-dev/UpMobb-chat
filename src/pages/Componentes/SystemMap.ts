export type SystemMapStep = {
  title: string;
  detail: string;
  files?: string[];
};

export type SystemMapFlow = {
  id: string;
  label: string;
  summary: string;
  steps: SystemMapStep[];
  payload?: string;
  notes?: string[];
};

export const SYSTEM_MAP_FLOWS: SystemMapFlow[] = [
  {
    id: "boot",
    label: "Boot do app",
    summary: "Entrada React + rotas com lazy (cada página vira chunk separado).",
    steps: [
      {
        title: "HTML / Vite",
        detail: "index.html carrega o bundle; Vite sobe o HMR.",
        files: ["index.html", "vite.config.ts"],
      },
      {
        title: "Entry React",
        detail: "Aplica tema salvo, monta BrowserRouter e AuthProvider.",
        files: ["src/main.tsx", "src/utils/theme.ts", "src/context/AuthContext.tsx"],
      },
      {
        title: "Rotas lazy",
        detail: "Login, Home, Contatos e Componentes só baixam ao entrar na URL.",
        files: ["src/App.tsx", "src/routes/index.tsx"],
      },
    ],
  },
  {
    id: "login",
    label: "Trilha de login",
    summary: "Usuário autentica, sessão fica no AuthContext e redireciona para o dashboard.",
    steps: [
      {
        title: "UI Login",
        detail: "Form e-mail/senha, lembrar e-mail, reset de senha.",
        files: ["src/pages/Login/Login.tsx", "src/pages/Login/Login.ts", "src/pages/Login/Login.css"],
      },
      {
        title: "Submit → service",
        detail: "Chama login({ email, password }). Hoje é mock com delay; depois vira POST real.",
        files: ["src/services/auth.ts"],
      },
      {
        title: "Sessão",
        detail: "setSession(user) no AuthContext; opcionalmente grava e-mail no localStorage.",
        files: ["src/context/AuthContext.tsx", "src/pages/Login/Login.ts"],
      },
      {
        title: "Navegação",
        detail: "navigate('/', { replace: true }) abre o Home.",
        files: ["src/pages/Login/Login.tsx", "src/pages/Home/Home.tsx"],
      },
    ],
    payload: `{
  "email": "user@empresa.com",
  "password": "••••••••"
}

// resposta mock (LoginResponse)
{
  "token": "mock-token",
  "user": { "id": "1", "name": "…", "email": "…" }
}`,
    notes: [
      "Endpoint futuro sugerido: POST /auth/login",
      "Reset: requestPasswordReset(email) → futuro POST /auth/forgot-password",
      "Auth ainda não protege rotas; sessão some no refresh (só state).",
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard (Conversas)",
    summary: "Rota `/` — lazy. Só carrega o chunk da Home (lista + chat), sem a lista de contatos.",
    steps: [
      {
        title: "Home page",
        detail: "Orquestra estado: filtro, busca, chat ativo, mensagens, loading.",
        files: ["src/pages/Home/Home.tsx", "src/pages/Home/Home.css"],
      },
      {
        title: "Template",
        detail: "HomeTemplate aplica data-mobile-panel (list | chat).",
        files: ["src/templates/Home/HomeTemplate.tsx"],
      },
      {
        title: "TopNav",
        detail: "Busca, navegação (URL), theme picker, logout. Contatos → navigate('/contatos').",
        files: ["src/componentes/TopNav/TopNav.tsx", "src/componentes/ThemePickerMenu/ThemePickerMenu.tsx"],
      },
      {
        title: "Lista de conversas",
        detail: "ChatList + FilterChip + skeleton; dados de SAMPLE_CHATS (mock).",
        files: [
          "src/componentes/ChatList/ChatList.tsx",
          "src/componentes/ChatItem/ChatItem.tsx",
          "src/utils/chatData.ts",
        ],
      },
      {
        title: "Painel direito",
        detail: "ChatEmpty (idle/loading) até selecionar conversa → ChatWindow.",
        files: ["src/componentes/ChatEmpty/ChatEmpty.tsx", "src/componentes/ChatWindow/ChatWindow.tsx"],
      },
    ],
    notes: [
      "Import lazy em routes/index.tsx — Home não puxa ContatosPage.",
      "Lista de chats: mock local (SAMPLE_CHATS).",
    ],
  },
  {
    id: "contatos",
    label: "Contatos (lista grande)",
    summary: "Rota `/contatos` — lazy. Mock ~420 clientes, paginação 40/página. Não entra no bundle da Home.",
    steps: [
      {
        title: "Navegação",
        detail: "TopNav Contatos → navigate('/contatos'). Chunk JS carrega sob demanda.",
        files: ["src/routes/index.tsx", "src/pages/Contatos/Contatos.tsx"],
      },
      {
        title: "Service",
        detail: "fetchContacts({ page, pageSize, query }) — mock local; futuro GET /contacts.",
        files: ["src/services/contacts.ts"],
      },
      {
        title: "UI",
        detail: "Tabela + busca + paginação. Só a página atual fica no state (não os 420 de uma vez na tela).",
        files: ["src/pages/Contatos/Contatos.tsx", "src/pages/Contatos/Contatos.css"],
      },
    ],
    payload: `// fetchContacts params
{ "page": 1, "pageSize": 40, "query": "ana" }

// resultado
{
  "items": [ { "id": "c-1", "name": "…", "phone": "…", "tags": [] } ],
  "total": 420,
  "page": 1,
  "pageSize": 40
}

// futuro
GET /contacts?page=1&pageSize=40&q=ana`,
    notes: [
      "Voltar pra Home não descarrega o chunk (cache do browser) — só evita baixar de novo.",
      "Próximo passo natural: virtualização se pageSize crescer muito.",
    ],
  },
  {
    id: "open-chat",
    label: "Abrir conversa",
    summary: "Clique no ChatItem → loading → fetch de mensagens → ChatWindow.",
    steps: [
      {
        title: "selectChat(id)",
        detail: "Home seta activeChatId, limpa mensagens, chatLoading=true.",
        files: ["src/pages/Home/Home.tsx"],
      },
      {
        title: "Fetch mensagens",
        detail: "fetchChatMessages(id) — Promise mock ~1.1s com SAMPLE_MESSAGES.",
        files: ["src/utils/chatData.ts"],
      },
      {
        title: "Render ChatWindow",
        detail: "Header, busca na conversa, bubbles, composer, menus, lightbox, document preview.",
        files: [
          "src/componentes/ChatWindow/ChatWindow.tsx",
          "src/componentes/MessageBubble/MessageBubble.tsx",
          "src/componentes/ChatInput/ChatInput.tsx",
        ],
      },
    ],
    payload: `// futuro
GET /chats/:chatId/messages

// hoje
fetchChatMessages(chatId) → ChatMessage[]`,
    notes: [
      "Token chatLoadToken evita race se o usuário clicar rápido em vários chats.",
      "Back (mobile/desktop) chama closeChat().",
    ],
  },
  {
    id: "send-message",
    label: "Enviar mensagem",
    summary: "Composer monta payload → Home cria batch local de ChatMessage (ainda sem API).",
    steps: [
      {
        title: "ChatInput",
        detail: "Texto (contentEditable), anexos múltiplos, paste, drag-drop, reply draft.",
        files: ["src/componentes/ChatInput/ChatInput.tsx", "src/componentes/ChatInput/ChatInput.ts"],
      },
      {
        title: "onSend(payload)",
        detail: "Sobe para ChatWindow → Home.handleSend.",
        files: ["src/componentes/ChatWindow/ChatWindow.tsx", "src/pages/Home/Home.tsx"],
      },
      {
        title: "Montagem local",
        detail: "Sem anexos: 1 mensagem. Com anexos: 1 msg por arquivo; texto/reply na última.",
        files: ["src/pages/Home/Home.tsx", "src/utils/chatData.ts"],
      },
    ],
    payload: `// ComposerSendPayload (ChatInput → Home)
{
  "text": "olá",
  "html": "<div>olá</div>",       // opcional
  "attachments": [
    {
      "id": "att-…",
      "kind": "image" | "video" | "file",
      "src": "blob:…",
      "name": "foto.png",
      "type": "image/png",
      "ext": "PNG",
      "sizeLabel": "120.5 KB"
    }
  ],
  "replyTo": {
    "author": "Ana Silva - Acme Corp",
    "text": "…",
    "image"?: true,
    "video"?: true,
    "attachment"?: { "name": "briefing.txt" }
  }
}

// futuro sugerido
POST /chats/:chatId/messages
Body: { text, html?, replyToId?, files[] }`,
    notes: [
      "Anexos usam URL.createObjectURL (blob) no cliente.",
      "Ainda não há upload HTTP — só estado React.",
    ],
  },
  {
    id: "overlays",
    label: "Overlays & menus",
    summary: "Padrão React: state open + portal + useDismissable / Escape.",
    steps: [
      {
        title: "Lightbox",
        detail: "Zoom de imagem (portal no body).",
        files: ["src/componentes/Lightbox/Lightbox.tsx", "src/utils/documentPreview.ts"],
      },
      {
        title: "DocumentPreview",
        detail: "PDF (iframe), TXT (fetch texto), DOC fallback + download.",
        files: ["src/componentes/DocumentPreview/DocumentPreview.tsx", "src/utils/documentPreview.ts"],
      },
      {
        title: "ConfirmModal",
        detail: "Ex.: deletar conversa no ChatMoreMenu.",
        files: ["src/componentes/ConfirmModal/ConfirmModal.tsx"],
      },
      {
        title: "MessageMenu",
        detail: "Context menu: reagir, responder, apagar (só out).",
        files: ["src/componentes/MessageMenu/MessageMenu.tsx", "src/hooks/useDismissable.ts"],
      },
    ],
  },
  {
    id: "folders",
    label: "Pastas do projeto",
    summary: "Onde colocar cada coisa no src/.",
    steps: [
      {
        title: "pages/",
        detail: "Telas com rota: Login, Home, Componentes.",
        files: ["src/pages/"],
      },
      {
        title: "templates/",
        detail: "Layout/shell reutilizável (HomeTemplate, Internas).",
        files: ["src/templates/"],
      },
      {
        title: "componentes/",
        detail: "UI isolada: Xxx.tsx + Xxx.ts + Xxx.css.",
        files: ["src/componentes/"],
      },
      {
        title: "services/",
        detail: "Chamadas de API / mocks (auth hoje).",
        files: ["src/services/auth.ts"],
      },
      {
        title: "context / hooks / utils",
        detail: "Estado global, hooks (useDismissable), helpers (theme, chatData, documentPreview).",
        files: ["src/context/", "src/hooks/", "src/utils/"],
      },
    ],
  },
];
