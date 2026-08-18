import type { ReactNode } from "react";

export type PageModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  /** Dialog mais largo (ex.: formulário da equipe). */
  wide?: boolean;
  className?: string;
};
