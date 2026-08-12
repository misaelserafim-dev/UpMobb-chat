import { MenuItem } from "@/componentes/MenuItem/MenuItem.tsx";
import type { ChatMoreMenuProps } from "./ChatMoreMenu.ts";
import "./ChatMoreMenu.css";

const DEFAULT_ITEMS = [
  { label: "Transferir", action: "transferir" },
  { label: "Retornar", action: "retornar" },
  { label: "Resolver", action: "resolver" },
  { label: "Deletar", action: "deletar", danger: true },
];

export function ChatMoreMenu({
  open = false,
  items = DEFAULT_ITEMS,
  onAction,
}: ChatMoreMenuProps) {
  if (!open) return null;

  return (
    <div className="chat-more__menu" id="chat-more-menu" role="menu">
      {items.map((item) => (
        <MenuItem
          key={item.action}
          label={item.label}
          action={item.action}
          danger={item.danger}
          onClick={() => onAction?.(item.action)}
        />
      ))}
    </div>
  );
}
