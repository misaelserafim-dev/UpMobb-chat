export type MessageMenuAction = "reply" | "delete" | "react";

export type MessageMenuProps = {
  open: boolean;
  x: number;
  y: number;
  canDelete?: boolean;
  onClose: () => void;
  onAction: (action: MessageMenuAction, emoji?: string) => void;
};
