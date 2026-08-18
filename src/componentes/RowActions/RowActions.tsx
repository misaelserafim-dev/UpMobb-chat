import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { RowActionsProps } from "./RowActions.ts";
import "./RowActions.css";

export function RowActions({
  onEdit,
  onDelete,
  onWhatsapp,
  editLabel = "Editar",
  deleteLabel = "Deletar",
  whatsappLabel = "Abrir ticket no WhatsApp",
  className = "contact-row__actions",
  children,
}: RowActionsProps) {
  return (
    <div className={className}>
      {children}
      {onWhatsapp ? (
        <button
          type="button"
          className="contact-row__action"
          data-contact-action="whatsapp"
          aria-label="WhatsApp"
          title={whatsappLabel}
          onClick={onWhatsapp}
        >
          <Icons.Whatsapp />
        </button>
      ) : null}
      <button
        type="button"
        className="contact-row__action"
        data-contact-action="editar"
        aria-label={editLabel}
        title={editLabel}
        onClick={onEdit}
      >
        <Icons.Edit />
      </button>
      <button
        type="button"
        className="contact-row__action contact-row__action--danger"
        data-contact-action="deletar"
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={onDelete}
      >
        <Icons.X />
      </button>
    </div>
  );
}
