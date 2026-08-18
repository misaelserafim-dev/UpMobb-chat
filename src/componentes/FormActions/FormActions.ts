export type FormActionsProps = {
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  /** Desabilita só o botão primário (ex.: lista vazia). */
  submitDisabled?: boolean;
  /** `submit` (padrão) para forms; `button` + `onSubmitClick` para ações soltas. */
  submitType?: "submit" | "button";
  onSubmitClick?: () => void;
  className?: string;
};
