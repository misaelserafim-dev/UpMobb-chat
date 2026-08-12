import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";

export const DEFAULT_FILTERS = [
  { id: "todos", label: "Todos", count: 21, dropdown: true },
  { id: "aguardando", label: "Aguardando", count: 11 },
  { id: "resolvidos", label: "Resolvidos", count: 40, dropdown: true },
  { id: "nao-lidas", label: "Não lidas", count: 5 },
];

export const SAMPLE_CHATS: ChatItemData[] = [
  {
    id: "t-35468",
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
      type: "icon",
      label: "Consultor / Vendedor UpMobb",
      icon: "https://resources.upmobb.tech/images/ico_pwa_192.png",
    },
  },
  {
    id: "t-35102",
    name: "Marcus Johnson",
    company: "Northwind Ltd",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    time: "Ontem",
    preview: "Contract sent over via email.",
    unread: 0,
    active: false,
    color: "#16a34a",
    assignee: "Carlos",
    tag: {
      type: "color",
      label: "VIP",
      color: "#ef4444",
    },
  },
  {
    id: "t-34891",
    name: "Sarah Thompson",
    company: "Bright Agency",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    time: "Ter",
    preview: "Can we reschedule our meeting?",
    unread: 2,
    active: false,
    color: "#ca8a04",
    assignee: "Nicoly",
    tag: {
      type: "color",
      label: "Suporte",
      color: "#8b5cf6",
    },
  },
];

export type ChatMessage = {
  id: string;
  from: "in" | "out";
  text?: string;
  html?: string;
  time: string;
  read?: boolean;
  forwarded?: boolean;
  replyTo?: {
    author?: string;
    text?: string;
    image?: boolean;
    video?: boolean;
    attachment?: { name?: string };
  };
  reactions?: Array<{ emoji: string; count: number }>;
  image?: { src: string; alt?: string };
  video?: { src: string; poster?: string };
  attachment?: {
    name: string;
    size?: string;
    pages?: string;
    type?: string;
    url?: string;
  };
};

export const SAMPLE_MESSAGES: ChatMessage[] = [
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
      url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    },
  },
  {
    id: "4b",
    from: "in",
    time: "10:38",
    attachment: {
      name: "briefing.txt",
      size: "1 KB",
      type: "file",
      url: "data:text/plain;charset=utf-8,Briefing%20Q3%0A%0A- Revisar%20metricas%0A- Validar%20proposta%0A- Enviar%20feedback",
    },
  },
  {
    id: "5",
    from: "in",
    text: "Thanks for the update! I'll review it.",
    time: "10:42",
  },
];

export function fetchChatMessages(_chatId: string): Promise<ChatMessage[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(SAMPLE_MESSAGES.map((m) => ({ ...m })));
    }, 1100);
  });
}
