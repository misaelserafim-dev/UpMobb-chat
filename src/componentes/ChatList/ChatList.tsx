import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { useEffect, useRef, useState } from "react";
import { ChatItem } from "@/componentes/ChatItem/ChatItem.tsx";
import { ChatListSkeleton, FiltersCarouselSkeleton } from "@/componentes/ChatListSkeleton/ChatListSkeleton.tsx";
import { FilterChip } from "@/componentes/FilterChip/FilterChip.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { DEFAULT_FILTERS } from "@/utils/chatData.ts";
import type { ChatListProps } from "./ChatList.ts";
import "./ChatList.css";
import "../FilterChip/FilterChip.css";
import "../ChatItem/ChatItem.css";
import "../ChatListSkeleton/ChatListSkeleton.css";

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
  onFilterChange,
  onChatSelect,
}: ChatListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const emblaRef = useRef<EmblaCarouselType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
    function onListResized() {
      emblaRef.current?.reInit();
    }
    window.addEventListener("chat-list-resized", onListResized);
    return () => window.removeEventListener("chat-list-resized", onListResized);
  }, []);

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
    <aside className="chat-list" aria-label="Lista de conversas">
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
          chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} onClick={() => onChatSelect?.(chat.id)} />
          ))
        ) : (
          <li className="chat-list__empty" />
        )}
      </ul>
    </aside>
  );
}
