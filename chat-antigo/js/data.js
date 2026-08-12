export const etiquetas = [
  { id: "vip", name: "VIP", color: "#ef4444" },
  { id: "suporte", name: "Suporte", color: "#8b5cf6" },
  { id: "consultor", name: "Consultor", color: "#0063a3" },
];

export const departamentos = [
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
    greeting: "Você selecionou o suporte técnico. 🔧 Conte o que está acontecendo.",
  },
  {
    id: "dept-treinamento",
    name: "Treinamento",
    color: "#65a30d",
    greeting: "Você está no setor de Treinamentos da UpMobb.",
  },
];

export const respostasRapidas = [
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
];

export const contacts = [
  {
    id: "ana",
    name: "Ana Silva",
    company: "Acme Corp",
    phone: "(11) 98888-1001",
    email: "",
    notes: "",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    color: "#0063a3",
    online: true,
    tags: [
      {
        id: "consultor",
        type: "icon",
        label: "Consultor / Vendedor UpMobb",
        icon: "https://resources.upmobb.tech/images/ico_pwa_192.png",
      },
    ],
  },
  {
    id: "marcus",
    name: "Marcus Johnson",
    company: "Northwind Ltd",
    phone: "(21) 97777-2202",
    email: "",
    notes: "",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    color: "#16a34a",
    tags: [
      {
        id: "vip",
        type: "color",
        label: "VIP",
        color: "#ef4444",
      },
    ],
  },
  {
    id: "sarah",
    name: "Sarah Thompson",
    company: "Bright Agency",
    phone: "(31) 96666-3303",
    email: "",
    notes: "",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    color: "#ca8a04",
    tags: [
      {
        id: "suporte",
        type: "color",
        label: "Suporte",
        color: "#8b5cf6",
      },
    ],
  },
];

export const chats = [
  {
    id: "t-35468",
    contactId: "ana",
    ticketId: "35468",
    name: "Ana Silva",
    company: "Acme Corp",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    time: "10:42",
    preview: "Thanks for the update! I'll review it.",
    unread: 0,
    active: false,
    color: "#0063a3",
    assignee: "Nicoly",
    tag: {
      id: "consultor",
      type: "icon",
      label: "Consultor / Vendedor UpMobb",
      icon: "https://resources.upmobb.tech/images/ico_pwa_192.png",
    },
  },
  {
    id: "t-35102",
    contactId: "marcus",
    ticketId: "35102",
    name: "Marcus Johnson",
    company: "Northwind Ltd",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    time: "Ontem",
    preview: "Contract sent over via email.",
    unread: 0,
    read: true,
    color: "#16a34a",
    assignee: "Carlos",
    tag: {
      id: "vip",
      type: "color",
      label: "VIP",
      color: "#ef4444",
    },
  },
  {
    id: "t-34891",
    contactId: "sarah",
    ticketId: "34891",
    name: "Sarah Thompson",
    company: "Bright Agency",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    time: "Ter",
    preview: "Can we reschedule our meeting?",
    unread: 2,
    color: "#ca8a04",
    assignee: "Nicoly",
    tag: {
      id: "suporte",
      type: "color",
      label: "Suporte",
      color: "#8b5cf6",
    },
  },
];

export const messages = [
  {
    id: "1",
    from: "in",
    text: "Hi! Do you have a moment to discuss the Q3 proposal?",
    time: "10:30",
  },
  {
    id: "2",
    from: "out",
    text: "Claro! Segue uma foto do moodboard.",
    time: "10:32",
    read: true,
    image: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
      alt: "Moodboard da campanha",
    },
  },
  {
    id: "3",
    from: "in",
    text: "Perfeito. Também gravei um vídeo curto do briefing.",
    time: "10:34",
    video: {
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster:
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop",
    },
  },
  {
    id: "4",
    from: "out",
    text: "Here's the revised proposal with the sustainability metrics included.",
    time: "10:36",
    read: false,
    attachment: {
      name: "Q3_Campaign_Proposal_v2.pdf",
      size: "2.4 MB",
      pages: "4 pages",
      type: "pdf",
      url: "./assets/Q3_Campaign_Proposal_v2.pdf",
    },
  },
  {
    id: "5",
    from: "in",
    text: "Thanks for the update! I'll review it.",
    time: "10:42",
  },
];
