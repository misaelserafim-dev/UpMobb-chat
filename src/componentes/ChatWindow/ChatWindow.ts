import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { ComposerSendPayload } from "@/componentes/ChatInput/ChatInput.ts";
import type { ChatMessage } from "@/utils/chatData.ts";

export type ChatWindowProps = {
  activeChat: ChatItemData;
  messages?: ChatMessage[];
  onBack?: () => void;
  onSend?: (payload: ComposerSendPayload) => void;
  onAction?: (action: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
};
