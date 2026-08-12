export type ConfirmModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
};
