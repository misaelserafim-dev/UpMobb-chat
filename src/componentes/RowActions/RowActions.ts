import type { ReactNode } from "react";

export type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  /** Ação extra à esquerda (ex.: WhatsApp em Contatos). */
  onWhatsapp?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  whatsappLabel?: string;
  /** Classe do container (ex.: `dept-row__actions`, `equipe-row__actions`). */
  className?: string;
  children?: ReactNode;
};
