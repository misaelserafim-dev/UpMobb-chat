import type { Ref } from "react";
import type { ListMorphPhase } from "@/hooks/useListResize.ts";
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
  morphPhase?: ListMorphPhase;
  resizeVersion?: number;
  onFilterChange?: (id: string) => void;
  onChatSelect?: (id: string) => void;
  onCreateTicket?: (chat: ChatItemData) => void;
  ref?: Ref<HTMLElement>;
};
