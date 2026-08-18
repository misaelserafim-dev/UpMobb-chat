import { useId } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { PageModalProps } from "./PageModal.ts";
import "./PageModal.css";

export function PageModal({
  open,
  title,
  onClose,
  children,
  id,
  wide = false,
  className = "",
}: PageModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className={["page-modal", "is-open", className].filter(Boolean).join(" ")}
      id={id}
    >
      <div className="page-modal__backdrop" />
      <div
        className={`page-modal__dialog${wide ? " page-modal__dialog--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button type="button" className="page-modal__close" aria-label="Fechar" onClick={onClose}>
          <Icons.X />
        </button>

        <h2 className="page-modal__title" id={titleId}>
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
