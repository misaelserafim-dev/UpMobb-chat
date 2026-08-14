import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import type { Contact } from "@/services/contacts.ts";

export type NewTicketModalProps = {
  open?: boolean;
  /** Contato já escolhido (ex.: ação WhatsApp em Contatos). */
  initialContact?: Contact | null;
  onClose?: () => void;
  onCreated?: (chat: ChatItemData) => void;
};
