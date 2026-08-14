import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";

export type NewTicketModalProps = {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (chat: ChatItemData) => void;
};
