import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { useEffect, useRef, useState } from "react";
import { AddButton } from "@/componentes/AddButton/AddButton.tsx";
import { ChatItem } from "@/componentes/ChatItem/ChatItem.tsx";
import { ChatListSkeleton, FiltersCarouselSkeleton } from "@/componentes/ChatListSkeleton/ChatListSkeleton.tsx";
import { FilterChip } from "@/componentes/FilterChip/FilterChip.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { NewTicketModal } from "@/componentes/NewTicketModal/NewTicketModal.tsx";
import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import { DEFAULT_FILTERS } from "@/utils/chatData.ts";
import type { ChatListProps } from "./ChatList.ts";
import "./ChatList.css";
import "../FilterChip/FilterChip.css";
import "../ChatItem/ChatItem.css";
import "../ChatListSkeleton/ChatListSkeleton.css";
import "../AddButton/AddButton.css";
import "../NewTicketModal/NewTicketModal.css";

const EMBLA_OPTIONS = {
  align: "start" as const,
  dragFree: true,
  containScroll: "trimSnaps" as const,
};

export function ChatList({
  chats = [],
  filters = DEFAULT_FILTERS,
  activeFilter = "todos",
  loading = false,
  morphPhase = "idle",
  resizeVersion = 0,
  onFilterChange,
  onChatSelect,
  onCreateTicket,
  ref,
}: ChatListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const emblaRef = useRef<EmblaCarouselType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);

  useEffect(() => {
    if (loading) {
      emblaRef.current?.destroy();
      emblaRef.current = null;
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const embla = EmblaCarousel(viewport, EMBLA_OPTIONS);
    emblaRef.current = embla;

    const syncButtons = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    embla.on("select", syncButtons);
    embla.on("reInit", syncButtons);
    embla.on("scroll", syncButtons);
    syncButtons();

    return () => {
      embla.destroy();
      emblaRef.current = null;
    };
  }, [loading, filters]);

  useEffect(() => {
    if (!resizeVersion) return;
    emblaRef.current?.reInit();
  }, [resizeVersion]);

  const filtersClass = [
    "embla",
    "chat-filters",
    loading ? "chat-filters--loading" : "",
    canScrollPrev ? "can-scroll-prev" : "",
    canScrollNext ? "can-scroll-next" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside
      ref={ref}
      className="chat-list"
      data-morph={morphPhase === "idle" ? undefined : morphPhase}
      aria-label="Lista de conversas"
    >
      <div
        className={filtersClass}
        id="filters-carousel"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando filtros" : undefined}
      >
        <button
          type="button"
          className={`embla__prev${canScrollPrev ? "" : " is-hidden"}`}
          aria-label="Filtros anteriores"
          disabled={loading || !canScrollPrev}
          onClick={() => emblaRef.current?.scrollPrev()}
        >
          <Icons.ChevronLeft />
        </button>

        <div className="embla__viewport" ref={viewportRef}>
          <div className="embla__container">
            {loading ? (
              <FiltersCarouselSkeleton count={5} />
            ) : (
              filters.map((f) => (
                <FilterChip
                  key={f.id}
                  id={f.id}
                  label={f.label}
                  count={f.count}
                  dropdown={f.dropdown}
                  active={f.id === activeFilter}
                  onClick={() => onFilterChange?.(f.id)}
                />
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          className={`embla__next${canScrollNext ? "" : " is-hidden"}`}
          aria-label="Próximos filtros"
          disabled={loading || !canScrollNext}
          onClick={() => emblaRef.current?.scrollNext()}
        >
          <Icons.ChevronRight />
        </button>
      </div>

      <ul
        className={`chat-list__items${loading ? " chat-list__items--loading" : ""}`}
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando conversas" : undefined}
      >
        {loading ? (
          <ChatListSkeleton count={6} />
        ) : chats.length ? (
          chats.map((chat, index) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              morphIndex={index}
              morphPhase={morphPhase}
              onClick={() => {
                if (chat.active) return;
                onChatSelect?.(chat.id);
              }}
            />
          ))
        ) : (
          <li className="chat-list__empty" />
        )}
      </ul>

      {onCreateTicket ? (
        <div className="chat-list__footer">
          <AddButton
            id="chat-list-add-btn"
            label="Novo ticket"
            title="Abrir novo ticket"
            className="chat-list__add"
            onClick={() => setTicketOpen(true)}
          />
        </div>
      ) : null}

      {onCreateTicket ? (
        <NewTicketModal
          open={ticketOpen}
          onClose={() => setTicketOpen(false)}
          onCreated={(chat: ChatItemData) => onCreateTicket(chat)}
        />
      ) : null}
    </aside>
  );
}
