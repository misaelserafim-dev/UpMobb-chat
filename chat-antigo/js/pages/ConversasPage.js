import { ChatList } from "../components/ChatList.js";
import { ChatWindow } from "../components/ChatWindow.js";
import { ChatEmpty } from "../components/ChatEmpty.js";

export function ConversasPage({
  chats = [],
  activeChat = null,
  messages = [],
  pendingAttachments = [],
  replyTo = null,
  activeFilter = "todos",
  searchQuery = "",
  msgSearchOpen = false,
  msgSearchQuery = "",
  chatLoading = false,
  listLoading = false,
} = {}) {
  const panel = chatLoading
    ? ChatEmpty({ loading: true })
    : activeChat
      ? ChatWindow({
          activeChat,
          messages,
          pendingAttachments,
          replyTo,
          msgSearchOpen,
          msgSearchQuery,
        })
      : ChatEmpty();

  return `
    ${ChatList({ chats, activeFilter, searchQuery, loading: listLoading })}
    <div
      class="list-resize-handle"
      id="list-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar lista de conversas"
      title="Arraste para redimensionar"
    >
      <span class="list-resize-handle__grip" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </div>
    ${panel}
  `;
}
