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
        detail: "Login, Home, Contatos, Etiquetas e Componentes só baixam ao entrar na URL.",
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
      "Layout: InternasTemplate (mesmo shell das outras internas).",
    ],
  },
  {
    id: "etiquetas",
    label: "Etiquetas",
    summary: "Rota `/etiquetas` — lazy. CRUD via service (payload tipado). Layout InternasTemplate.",
    steps: [
      {
        title: "Navegação",
        detail: "TopNav Configurações → Etiqueta → navigate('/etiquetas').",
        files: ["src/routes/index.tsx", "src/pages/Etiquetas/Etiquetas.tsx"],
      },
      {
        title: "Service",
        detail: "fetch / create / update / delete — página só monta o payload e chama o service.",
        files: ["src/services/etiquetas.ts"],
      },
      {
        title: "UI",
        detail: "Grid de chips + modal criar/editar + ConfirmModal deletar + skeleton.",
        files: [
          "src/pages/Etiquetas/Etiquetas.tsx",
          "src/templates/Internas/InternasTemplate.tsx",
        ],
      },
    ],
    payload: `// listar
fetchEtiquetas({ page: 1, pageSize: 40, query: "vip" })
→ { items, total, page, pageSize }

// criar
createEtiqueta({ name: "VIP", color: "#ef4444" })

// atualizar
updateEtiqueta({ id: "vip", name: "VIP", color: "#dc2626" })

// remover
deleteEtiqueta({ id: "vip" })

// futuro
GET    /etiquetas?page=&pageSize=&q=
POST   /etiquetas
PUT    /etiquetas/:id
DELETE /etiquetas/:id`,
    notes: [
      "Mock em memória no módulo do service (persiste na sessão até refresh).",
      "CRUD atualiza só o item no state — sem skeleton na lista inteira.",
    ],
  },
  {
    id: "departamentos",
    label: "Departamentos",
    summary: "Rota `/departamentos` — lazy. CRUD via service. Layout InternasTemplate + tabela dept-*.",
    steps: [
      {
        title: "Navegação",
        detail: "TopNav Configurações → Departamento → navigate('/departamentos').",
        files: ["src/routes/index.tsx", "src/pages/Departamentos/Departamentos.tsx"],
      },
      {
        title: "Service",
        detail: "fetch / create / update / delete com payload tipado.",
        files: ["src/services/departamentos.ts"],
      },
      {
        title: "UI",
        detail: "Tabela nome/cor/saudação + modal + ConfirmModal + skeleton.",
        files: [
          "src/pages/Departamentos/Departamentos.tsx",
          "src/templates/Internas/InternasTemplate.tsx",
        ],
      },
    ],
    payload: `// listar
fetchDepartamentos({ page: 1, pageSize: 40, query: "comercial" })

// criar
createDepartamento({
  name: "Comercial",
  color: "#1d4ed8",
  greeting: "Olá! Somos o comercial…"
})

// atualizar
updateDepartamento({ id: "dept-comercial", name, color, greeting })

// remover
deleteDepartamento({ id: "dept-comercial" })

// futuro
GET    /departamentos?page=&pageSize=&q=
POST   /departamentos
PUT    /departamentos/:id
DELETE /departamentos/:id`,
  },
  {
    id: "respostas-rapidas",
    label: "Respostas rápidas",
    summary: "Rota `/respostas-rapidas` — lazy. CRUD via service. Layout InternasTemplate.",
    steps: [
      {
        title: "Navegação",
        detail: "TopNav Configurações → Resposta rápida → navigate('/respostas-rapidas').",
        files: ["src/routes/index.tsx", "src/pages/RespostasRapidas/RespostasRapidas.tsx"],
      },
      {
        title: "Service",
        detail: "fetch / create / update / delete com payload tipado.",
        files: ["src/services/respostasRapidas.ts"],
      },
      {
        title: "UI",
        detail: "Tabela atalho/texto + modal + ConfirmModal + skeleton.",
        files: [
          "src/pages/RespostasRapidas/RespostasRapidas.tsx",
          "src/templates/Internas/InternasTemplate.tsx",
        ],
      },
    ],
    payload: `// listar
fetchRespostasRapidas({ page: 1, pageSize: 40, query: "ola" })

// criar
createRespostaRapida({ shortcut: "ola", text: "Olá!…" })

// atualizar
updateRespostaRapida({ id: "rr-ola", shortcut, text })

// remover
deleteRespostaRapida({ id: "rr-ola" })

// futuro
GET    /respostas-rapidas?page=&pageSize=&q=
POST   /respostas-rapidas
PUT    /respostas-rapidas/:id
DELETE /respostas-rapidas/:id`,
  },
  {
    id: "equipe",
    label: "Equipe",
    summary: "Rota `/equipe` — lazy. CRUD via service. Layout InternasTemplate + formulário largo.",
    steps: [
      {
        title: "Navegação",
        detail: "TopNav Configurações → Equipe → navigate('/equipe').",
        files: ["src/routes/index.tsx", "src/pages/Equipe/Equipe.tsx"],
      },
      {
        title: "Service",
        detail: "fetch / create / update / delete com payload tipado (perms + depts).",
        files: ["src/services/equipe.ts", "src/services/departamentos.ts"],
      },
      {
        title: "UI",
        detail: "Tabela membros + modal (conexões, perfil, depts, permissões) + ConfirmModal.",
        files: [
          "src/pages/Equipe/Equipe.tsx",
          "src/componentes/LetterAvatar/LetterAvatar.tsx",
          "src/templates/Internas/InternasTemplate.tsx",
        ],
      },
    ],
    payload: `// listar
fetchEquipe({ page: 1, pageSize: 40, query: "nicoly" })

// criar
createEquipeMember({
  name, email, password, connectionId, profile,
  departamentoIds: ["dept-comercial"],
  permissions: { historico: true, … }
})

// atualizar
updateEquipeMember({ id, name, email, password?, … })

// remover
deleteEquipeMember({ id: "eq-nicoly" })

// futuro
GET    /equipe?page=&pageSize=&q=
POST   /equipe
PUT    /equipe/:id
DELETE /equipe/:id`,
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
        detail: "Chamadas de API / mocks (auth, contacts, etiquetas, departamentos, respostasRapidas, equipe).",
        files: [
          "src/services/auth.ts",
          "src/services/contacts.ts",
          "src/services/etiquetas.ts",
          "src/services/departamentos.ts",
          "src/services/respostasRapidas.ts",
          "src/services/equipe.ts",
        ],
      },
      {
        title: "context / hooks / utils",
        detail: "Estado global, hooks (useDismissable), helpers (theme, chatData, documentPreview).",
        files: ["src/context/", "src/hooks/", "src/utils/"],
      },
    ],
  },
];
