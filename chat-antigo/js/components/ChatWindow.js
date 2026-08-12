import { ChatInput } from "./ChatInput.js";
import { MessageBubble } from "./MessageBubble.js";
import { Icons } from "../icons.js";
import { ChatMoreMenu } from "../ui/index.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function ChatWindow({
  activeChat,
  messages = [],
  pendingAttachments = [],
  replyTo = null,
  msgSearchOpen = false,
  msgSearchQuery = "",
} = {}) {
  return `
    <main class="chat-window" id="chat-window" aria-label="Conversa com ${escapeAttr(activeChat.name)}">
      <header class="chat-window__header">
        <div class="chat-window__identity">
          <button type="button" class="chat-window__back icon-btn" aria-label="Voltar">
            ${Icons.chevronLeft}
          </button>
          <img
            class="chat-window__avatar"
            src="${escapeAttr(activeChat.avatar)}"
            alt=""
          />
          <div class="chat-window__meta">
            <div class="chat-window__name" id="chat-contact-name">${escapeHtml(activeChat.name)}</div>
            <div class="chat-window__assignee" id="chat-contact-assignee">
              <small>Responsável</small>: ${escapeHtml(activeChat.assignee || "")}
            </div>
          </div>
        </div>
        <div class="chat-window__actions">
          <button
            type="button"
            class="icon-btn ${msgSearchOpen ? "is-active" : ""}"
            id="chat-search-toggle"
            aria-label="Buscar na conversa"
            aria-pressed="${msgSearchOpen}"
          >${Icons.search}</button>

          <div class="chat-more" id="chat-more">
            <button
              type="button"
              class="icon-btn"
              id="chat-more-btn"
              aria-label="Mais opções"
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls="chat-more-menu"
            >${Icons.more}</button>
            ${ChatMoreMenu({ id: "chat-more-menu", hidden: true })}
          </div>
        </div>
      </header>

      <div class="chat-msg-search ${msgSearchOpen ? "is-open" : ""}" id="chat-msg-search" ${msgSearchOpen ? "" : "hidden"}>
        ${Icons.search}
        <input
          type="search"
          id="chat-msg-search-input"
          class="chat-msg-search__input"
          placeholder="Buscar na conversa"
          aria-label="Buscar na conversa"
          value="${escapeAttr(msgSearchQuery)}"
        />
        <span class="chat-msg-search__count" id="chat-msg-search-count"></span>
        <button type="button" class="chat-msg-search__close" id="chat-msg-search-close" aria-label="Fechar busca">
          ${Icons.x}
        </button>
      </div>

      <div class="chat-window__messages" id="chat-messages" role="log" aria-live="polite">
        <div class="date-separator">Hoje</div>
        ${messages
          .map((msg) =>
            MessageBubble(msg, {
              senderName: activeChat.company
                ? `${activeChat.name} - ${activeChat.company}`
                : activeChat.name,
            })
          )
          .join("")}
      </div>

      ${ChatInput({ pendingAttachments, replyTo })}
    </main>
  `;
}


