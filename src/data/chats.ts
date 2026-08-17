import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type {
  CreateChatPayload,
  FetchChatsResult,
  ReactChatMessagePayload,
  SendChatMessagePayload,
} from "@/services/chats.ts";
import type { ChatMessage } from "@/utils/chatData.ts";

export const MOCK_CHATS: ChatItemData[] = [
  {
    id: "t-35468",
    name: "Ana Silva",
    company: "Acme Corp",
    phone: "+55 11 99876-5432",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
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
    phone: "+55 21 98765-4321",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
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
    phone: "+55 41 98995-6958",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
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

export const MOCK_MESSAGES: ChatMessage[] = [
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
    id: "4c",
    from: "in",
    time: "10:40",
    audio: {
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      durationSec: 2,
    },
  },
  {
    id: "5",
    from: "in",
    text: "Thanks for the update! I'll review it.",
    time: "10:42",
  },
];

let chats = MOCK_CHATS.map((c) => ({ ...c }));
const messagesByChat = new Map<string, ChatMessage[]>();

function cloneMessage(msg: ChatMessage): ChatMessage {
  return {
    ...msg,
    replyTo: msg.replyTo
      ? {
          ...msg.replyTo,
          attachment: msg.replyTo.attachment ? { ...msg.replyTo.attachment } : undefined,
        }
      : undefined,
    reactions: msg.reactions?.map((r) => ({ ...r })),
    image: msg.image ? { ...msg.image } : undefined,
    video: msg.video ? { ...msg.video } : undefined,
    audio: msg.audio ? { ...msg.audio } : undefined,
    attachment: msg.attachment ? { ...msg.attachment } : undefined,
  };
}

function getMessages(chatId: string): ChatMessage[] {
  let list = messagesByChat.get(chatId);
  if (!list) {
    list = MOCK_MESSAGES.map(cloneMessage);
    messagesByChat.set(chatId, list);
  }
  return list;
}

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

/** Roteador mock alinhado às rotas REST do `services/chats.ts`. */
export async function mockChatsRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/chats") {
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = q
      ? chats.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.preview || "").toLowerCase().includes(q) ||
            (c.phone || "").toLowerCase().includes(q) ||
            (c.company || "").toLowerCase().includes(q),
        )
      : chats;

    const start = (page - 1) * pageSize;
    const result: FetchChatsResult = {
      items: filtered.slice(start, start + pageSize).map((c) => ({ ...c })),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/chats") {
    const payload = body as CreateChatPayload;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const id = `t-${Date.now()}`;
    const ticketNo = id.replace(/\D/g, "") || String(Date.now());
    const dateLabel = now.toLocaleDateString("pt-BR");

    const created: ChatItemData = {
      id,
      name: payload.name.trim(),
      phone: payload.phone?.trim() || undefined,
      avatar: payload.avatar,
      time,
      preview: `Atendimento iniciado · #${ticketNo}`,
      unread: 0,
      active: false,
      color: payload.departamentoColor,
      assignee: payload.assignee || "Você",
      tag: payload.etiquetaId
        ? {
            type: "color",
            label: payload.etiquetaName || "",
            color: payload.etiquetaColor || "#9ca3af",
          }
        : undefined,
    };

    chats = [created, ...chats];
    messagesByChat.set(id, [
      {
        id: `${id}-notice`,
        from: "system",
        time,
        text: `Atendimento iniciado ${dateLabel} às ${time} · #${ticketNo}`,
      },
    ]);

    return { ...created };
  }

  const chatMatch = pathname.match(/^\/chats\/([^/]+)$/);
  if (m === "DELETE" && chatMatch) {
    const id = decodeURIComponent(chatMatch[1]);
    chats = chats.filter((c) => c.id !== id);
    messagesByChat.delete(id);
    return { id };
  }

  const messagesMatch = pathname.match(/^\/chats\/([^/]+)\/messages$/);
  if (messagesMatch) {
    const chatId = decodeURIComponent(messagesMatch[1]);

    if (m === "GET") {
      return getMessages(chatId).map(cloneMessage);
    }

    if (m === "POST") {
      const payload = body as Pick<SendChatMessagePayload, "message">;
      const list = getMessages(chatId);
      const created = cloneMessage(payload.message);
      list.push(created);
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        chat.preview = created.text || created.attachment?.name || chat.preview;
        chat.time = created.time;
      }
      return cloneMessage(created);
    }
  }

  const messageMatch = pathname.match(/^\/chats\/([^/]+)\/messages\/([^/]+)$/);
  if (m === "DELETE" && messageMatch) {
    const chatId = decodeURIComponent(messageMatch[1]);
    const messageId = decodeURIComponent(messageMatch[2]);
    const list = getMessages(chatId);
    messagesByChat.set(
      chatId,
      list.filter((msg) => msg.id !== messageId),
    );
    return { id: messageId };
  }

  const reactionMatch = pathname.match(
    /^\/chats\/([^/]+)\/messages\/([^/]+)\/reactions$/,
  );
  if (m === "POST" && reactionMatch) {
    const chatId = decodeURIComponent(reactionMatch[1]);
    const messageId = decodeURIComponent(reactionMatch[2]);
    const payload = body as Pick<ReactChatMessagePayload, "emoji">;
    const list = getMessages(chatId);
    const msg = list.find((item) => item.id === messageId);
    if (!msg) throw new Error("Mensagem não encontrada");

    const reactions = [...(msg.reactions || [])];
    const existing = reactions.find((r) => r.emoji === payload.emoji);
    if (existing) existing.count += 1;
    else reactions.push({ emoji: payload.emoji, count: 1 });
    msg.reactions = reactions;
    return cloneMessage(msg);
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
