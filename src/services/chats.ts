import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import { apiRequest } from "@/services/api.ts";

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

export type CreateChatPayload = {
  contactId: string;
  name: string;
  phone?: string;
  avatar?: string;
  departamentoId: string;
  departamentoName: string;
  departamentoColor: string;
  etiquetaId?: string;
  etiquetaName?: string;
  etiquetaColor?: string;
  assignee?: string;
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

/** GET /chats?page=&pageSize=&q= */
export async function fetchChats(params: FetchChatsParams = {}): Promise<FetchChatsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchChatsResult>(`/chats?${search}`);
}

/** DELETE /chats/:id */
export async function deleteChat(payload: DeleteChatPayload): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/chats/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
}

/** POST /chats */
export async function createChat(payload: CreateChatPayload): Promise<ChatItemData> {
  return apiRequest<ChatItemData>("/chats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /chats/:id/messages */
export async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  return apiRequest<ChatMessage[]>(`/chats/${encodeURIComponent(chatId)}/messages`);
}

/** POST /chats/:id/messages */
export async function sendChatMessage(
  payload: SendChatMessagePayload,
): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(
    `/chats/${encodeURIComponent(payload.chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message: payload.message }),
    },
  );
}

/** DELETE /chats/:chatId/messages/:messageId */
export async function deleteChatMessage(
  payload: DeleteChatMessagePayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(
    `/chats/${encodeURIComponent(payload.chatId)}/messages/${encodeURIComponent(payload.messageId)}`,
    { method: "DELETE" },
  );
}

/** POST /chats/:chatId/messages/:messageId/reactions */
export async function reactChatMessage(
  payload: ReactChatMessagePayload,
): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(
    `/chats/${encodeURIComponent(payload.chatId)}/messages/${encodeURIComponent(payload.messageId)}/reactions`,
    {
      method: "POST",
      body: JSON.stringify({ emoji: payload.emoji }),
    },
  );
}
