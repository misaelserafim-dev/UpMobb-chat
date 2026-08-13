import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import {
  SAMPLE_CHATS,
  SAMPLE_MESSAGES,
  type ChatMessage,
} from "@/utils/chatData.ts";

export type { ChatMessage };

export type FetchChatsParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchChatsResult = {
  items: ChatItemData[];
  total: number;
  page: number;
  pageSize: number;
};

export type DeleteChatPayload = {
  id: string;
};

export type SendChatMessagePayload = {
  chatId: string;
  message: ChatMessage;
};

export type DeleteChatMessagePayload = {
  chatId: string;
  messageId: string;
};

export type ReactChatMessagePayload = {
  chatId: string;
  messageId: string;
  emoji: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

let chats = SAMPLE_CHATS.map((c) => ({ ...c }));
const messagesByChat = new Map<string, ChatMessage[]>();

function cloneMessage(msg: ChatMessage): ChatMessage {
  return {
    ...msg,
    replyTo: msg.replyTo ? { ...msg.replyTo, attachment: msg.replyTo.attachment ? { ...msg.replyTo.attachment } : undefined } : undefined,
    reactions: msg.reactions?.map((r) => ({ ...r })),
    image: msg.image ? { ...msg.image } : undefined,
    video: msg.video ? { ...msg.video } : undefined,
    attachment: msg.attachment ? { ...msg.attachment } : undefined,
  };
}

function getMessages(chatId: string): ChatMessage[] {
  let list = messagesByChat.get(chatId);
  if (!list) {
    list = SAMPLE_MESSAGES.map(cloneMessage);
    messagesByChat.set(chatId, list);
  }
  return list;
}

/**
 * Futuro: GET /chats?page=&pageSize=&q=
 * Hoje: mock local — a Home só troca a implementação aqui.
 */
export async function fetchChats(params: FetchChatsParams = {}): Promise<FetchChatsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(420);

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
  const items = filtered.slice(start, start + pageSize).map((c) => ({ ...c }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/**
 * Futuro: DELETE /chat/delet/:id  (ou DELETE /chats/:id)
 * Hoje: remove do mock em memória.
 */
export async function deleteChat(payload: DeleteChatPayload): Promise<{ id: string }> {
  await wait(280);
  chats = chats.filter((c) => c.id !== payload.id);
  messagesByChat.delete(payload.id);
  return { id: payload.id };
}

/**
 * Futuro: GET /chats/:id/messages
 * Hoje: mock local com delay de “loading”.
 */
export async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  await wait(1100);
  return getMessages(chatId).map(cloneMessage);
}

/**
 * Futuro: POST /chats/:id/messages
 * Hoje: append no mock em memória.
 */
export async function sendChatMessage(
  payload: SendChatMessagePayload,
): Promise<ChatMessage> {
  await wait(180);
  const list = getMessages(payload.chatId);
  const created = cloneMessage(payload.message);
  list.push(created);
  const chat = chats.find((c) => c.id === payload.chatId);
  if (chat) {
    chat.preview = created.text || created.attachment?.name || chat.preview;
    chat.time = created.time;
  }
  return cloneMessage(created);
}

/**
 * Futuro: DELETE /chats/:chatId/messages/:messageId
 */
export async function deleteChatMessage(
  payload: DeleteChatMessagePayload,
): Promise<{ id: string }> {
  await wait(200);
  const list = getMessages(payload.chatId);
  messagesByChat.set(
    payload.chatId,
    list.filter((m) => m.id !== payload.messageId),
  );
  return { id: payload.messageId };
}

/**
 * Futuro: POST /chats/:chatId/messages/:messageId/reactions
 */
export async function reactChatMessage(
  payload: ReactChatMessagePayload,
): Promise<ChatMessage> {
  await wait(160);
  const list = getMessages(payload.chatId);
  const msg = list.find((m) => m.id === payload.messageId);
  if (!msg) {
    throw new Error("Mensagem não encontrada");
  }
  const reactions = [...(msg.reactions || [])];
  const existing = reactions.find((r) => r.emoji === payload.emoji);
  if (existing) existing.count += 1;
  else reactions.push({ emoji: payload.emoji, count: 1 });
  msg.reactions = reactions;
  return cloneMessage(msg);
}
