import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";

export type ComponentesProps = Record<string, never>;

export const DEMO_CHATS: ChatItemData[] = [
  {
    id: "1",
    name: "Ana Souza",
    company: "Acme Corp",
    phone: "+55 11 99123-4567",
    avatar: "https://i.pravatar.cc/80?u=ana",
    time: "10:42",
    preview: "Pode me enviar o orçamento?",
    unread: 2,
    active: true,
    color: "#0063a3",
    assignee: "Nicoly",
    tag: { type: "color", color: "#22c55e", label: "WhatsApp" },
  },
  {
    id: "2",
    name: "Carlos Lima",
    phone: "+55 11 98888-1122",
    avatar: "https://i.pravatar.cc/80?u=carlos",
    time: "Ontem",
    preview: "Ok, combinado!",
    unread: 0,
    active: false,
    assignee: "Carlos",
  },
];

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    from: "in",
    text: "Oi! Tem um momento para falar da proposta?",
    time: "10:30",
  },
  {
    id: "m2",
    from: "out",
    text: "Claro — segue a foto.",
    time: "10:32",
    read: true,
    image: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
      alt: "Moodboard",
    },
  },
  {
    id: "m3",
    from: "out",
    text: "Recebi, obrigado!",
    time: "10:33",
    read: true,
    replyTo: {
      author: "Ana Souza - Acme Corp",
      text: "briefing.txt",
      attachment: { name: "briefing.txt" },
    },
  },
  {
    id: "m4",
    from: "out",
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
];

export const DEMO_DOC: DocumentPreviewFile = {
  name: "briefing.txt",
  size: "1 KB",
  type: "file",
  url: "data:text/plain;charset=utf-8,Briefing%20Q3%0A%0A- Revisar%20metricas%0A- Validar%20proposta",
};
