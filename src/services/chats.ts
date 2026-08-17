import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import { apiListRequest, apiRequest } from "@/services/api.ts";
import { getStoredUser } from "@/services/auth.ts";

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

// Formato do backend (/panel/conversations)
type ConversationDto = {
  id: string;
  status: "waiting" | "open" | "resolved";
  type: "individual" | "group";
  assignedUserId: string | null;
  lastMessageAt: string;
  contactName: string | null;
  contactPhone: string;
  departmentName: string | null;
  departmentColor: string | null;
};

type MessageDto = {
  id: string;
  direction: "inbound" | "outbound";
  type: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt: string;
};

function formatTime(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function toChatItem(dto: ConversationDto): ChatItemData {
  return {
    id: dto.id,
    name: dto.contactName || dto.contactPhone,
    phone: dto.contactPhone,
    time: formatTime(dto.lastMessageAt),
    color: dto.departmentColor || undefined,
    tag: dto.departmentName
      ? { type: "color", label: dto.departmentName, color: dto.departmentColor || undefined }
      : undefined,
  };
}

function toChatMessage(dto: MessageDto): ChatMessage {
  return {
    id: dto.id,
    from: dto.type === "system" ? "system" : dto.direction === "inbound" ? "in" : "out",
    text: dto.content,
    time: formatTime(dto.sentAt),
    read: dto.status === "sent",
  };
}

/** GET /panel/conversations — admin vê "todos"; agente vê "meus". */
export async function fetchChats(params: FetchChatsParams = {}): Promise<FetchChatsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const filter = getStoredUser()?.role === "admin" ? "todos" : "meus";

  const res = await apiListRequest<ConversationDto>(
    `/panel/conversations?filter=${filter}&page=${page}&limit=${pageSize}`,
  );

  return {
    items: res.data.map(toChatItem),
    total: res.page?.total ?? res.data.length,
    page,
    pageSize,
  };
}

/** GET /panel/conversations/:id/messages — backend devolve das mais novas pras antigas. */
export async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  const res = await apiListRequest<MessageDto>(
    `/panel/conversations/${encodeURIComponent(chatId)}/messages?page=1&limit=100`,
  );
  return res.data.map(toChatMessage).reverse();
}

/** POST /panel/conversations/:id/messages */
export async function sendChatMessage(
  payload: SendChatMessagePayload,
): Promise<ChatMessage> {
  const text = payload.message.text?.trim();
  if (!text) {
    throw new Error("Envio de mídia ainda não suportado — apenas texto.");
  }

  const dto = await apiRequest<MessageDto>(
    `/panel/conversations/${encodeURIComponent(payload.chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
  return toChatMessage(dto);
}

/** POST /panel/conversations/:id/assign — agente assume a conversa. */
export async function assignChat(chatId: string): Promise<void> {
  await apiRequest(`/panel/conversations/${encodeURIComponent(chatId)}/assign`, {
    method: "POST",
  });
}

/** POST /panel/conversations/:id/resolve — encerra o atendimento. */
export async function resolveChat(chatId: string): Promise<void> {
  await apiRequest(`/panel/conversations/${encodeURIComponent(chatId)}/resolve`, {
    method: "POST",
  });
}

// Ações abaixo não existem no backend (conversas nascem do WhatsApp; mensagem não se apaga).

export async function createChat(_payload: CreateChatPayload): Promise<ChatItemData> {
  throw new Error("Conversas são iniciadas pelo cliente no WhatsApp.");
}

export async function deleteChat(_payload: DeleteChatPayload): Promise<{ id: string }> {
  throw new Error("Excluir conversa não é suportado — use resolver.");
}

export async function deleteChatMessage(
  _payload: DeleteChatMessagePayload,
): Promise<{ id: string }> {
  throw new Error("Apagar mensagem não é suportado pelo backend.");
}

export async function reactChatMessage(
  _payload: ReactChatMessagePayload,
): Promise<ChatMessage> {
  throw new Error("Reações ainda não são suportadas pelo backend.");
}
