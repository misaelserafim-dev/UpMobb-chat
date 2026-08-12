export type ChatMoreMenuItem = {
  label: string;
  action: string;
  danger?: boolean;
};

export type ChatMoreMenuProps = {
  open?: boolean;
  items?: ChatMoreMenuItem[];
  onAction?: (action: string) => void;
};
