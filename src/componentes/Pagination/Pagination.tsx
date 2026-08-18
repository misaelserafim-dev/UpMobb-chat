import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { PaginationProps } from "./Pagination.ts";
import "./Pagination.css";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
  hideWhenSingle = true,
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);

  if (hideWhenSingle && safeTotal <= 1) return null;

  return (
    <div
      className={["pagination", className].filter(Boolean).join(" ")}
      role="navigation"
      aria-label="Paginação"
    >
      <button
        type="button"
        className="pagination__btn"
        disabled={disabled || safePage <= 1}
        aria-label="Página anterior"
        title="Anterior"
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
      >
        <Icons.ChevronLeft />
      </button>
      <span className="pagination__info">
        Página {safePage} de {safeTotal}
      </span>
      <button
        type="button"
        className="pagination__btn"
        disabled={disabled || safePage >= safeTotal}
        aria-label="Próxima página"
        title="Próxima"
        onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
      >
        <Icons.ChevronRight />
      </button>
    </div>
  );
}
