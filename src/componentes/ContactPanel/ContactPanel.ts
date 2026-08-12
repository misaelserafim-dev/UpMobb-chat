import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";

export type ContactMediaItem = {
  id: string;
  kind: "image" | "video" | "file";
  src?: string;
  poster?: string;
  name?: string;
  attachment?: DocumentPreviewFile;
};

export type ContactPanelProps = {
  chat: ChatItemData;
  phone?: string;
  media?: ContactMediaItem[];
  onClose?: () => void;
  onEdit?: () => void;
  onOpenImage?: (src: string) => void;
  onOpenDocument?: (file: DocumentPreviewFile) => void;
};

/** Telefone mock estável a partir do id da conversa (até vir do backend). */
export function mockPhoneFromChatId(chatId: string): string {
  let hash = 0;
  for (let i = 0; i < chatId.length; i += 1) {
    hash = (hash * 31 + chatId.charCodeAt(i)) >>> 0;
  }
  const n = String(10000000 + (hash % 90000000)).slice(0, 8);
  return `+55 (11) 9${n.slice(0, 4)}-${n.slice(4)}`;
}

export function collectChatMedia(messages: ChatMessage[]): ContactMediaItem[] {
  const items: ContactMediaItem[] = [];
  for (const msg of messages) {
    if (msg.image?.src) {
      items.push({
        id: `${msg.id}-img`,
        kind: "image",
        src: msg.image.src,
        name: msg.image.alt || "Imagem",
      });
    }
    if (msg.video?.src) {
      items.push({
        id: `${msg.id}-vid`,
        kind: "video",
        src: msg.video.src,
        poster: msg.video.poster,
        name: "Vídeo",
      });
    }
    if (msg.attachment?.url) {
      items.push({
        id: `${msg.id}-file`,
        kind: "file",
        name: msg.attachment.name,
        attachment: {
          name: msg.attachment.name,
          size: msg.attachment.size,
          pages: msg.attachment.pages,
          type: msg.attachment.type,
          url: msg.attachment.url,
        },
      });
    }
  }
  return items;
}
