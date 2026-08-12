import { Icons } from "../icons.js";
import { ChatListSkeleton, FiltersCarouselSkeleton } from "./ChatListSkeleton.js";
import { FilterChip } from "../ui/FilterChip.js";
import { ChatItem } from "../ui/ChatItem.js";
import { escapeAttr } from "../utils/escape.js";

export const DEFAULT_FILTERS = [
  { id: "todos", label: "Todos", count: 21, dropdown: true },
  { id: "aguardando", label: "Aguardando", count: 11 },
  { id: "resolvidos", label: "Resolvidos", count: 40, dropdown: true },
  { id: "nao-lidas", label: "Não lidas", count: 5 },
];

export function ChatList({
  chats = [],
  filters = DEFAULT_FILTERS,
  activeFilter = "todos",
  searchQuery = "",
  loading = false,
} = {}) {
  return `
    <aside class="chat-list" aria-label="Lista de conversas">
      <div
        class="embla chat-filters ${loading ? "chat-filters--loading" : ""}"
        id="filters-carousel"
        ${loading ? 'aria-busy="true" aria-label="Carregando filtros"' : ""}
      >
        <button
          type="button"
          class="embla__prev"
          aria-label="Filtros anteriores"
          disabled
        >${Icons.chevronLeft}</button>

        <div class="embla__viewport">
          <div class="embla__container">
            ${
              loading
                ? FiltersCarouselSkeleton({ count: 5 })
                : filters
                    .map((f) =>
                      FilterChip({
                        ...f,
                        active: f.id === activeFilter,
                      })
                    )
                    .join("")
            }
          </div>
        </div>

        <button
          type="button"
          class="embla__next"
          aria-label="Próximos filtros"
          ${loading ? "disabled" : ""}
        >${Icons.chevronRight}</button>
      </div>

      <ul
        class="chat-list__items ${loading ? "chat-list__items--loading" : ""}"
        id="chat-list-items"
        ${loading ? 'aria-busy="true" aria-label="Carregando conversas"' : ""}
      >
        ${loading ? ChatListSkeleton({ count: 6 }) : renderChatItems(chats)}
      </ul>
    </aside>
  `;
}

export function renderChatItems(chats = []) {
  if (!chats.length) {
    return `<li class="chat-list__empty"></li>`;
  }
  return chats.map((chat) => ChatItem(chat)).join("");
}

