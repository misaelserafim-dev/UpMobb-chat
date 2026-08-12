import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";

export type ChatFilter = {
  id: string;
  label: string;
  count?: number;
  dropdown?: boolean;
};

export type ChatListProps = {
  chats?: ChatItemData[];
  filters?: ChatFilter[];
  activeFilter?: string;
  loading?: boolean;
  onFilterChange?: (id: string) => void;
  onChatSelect?: (id: string) => void;
};
