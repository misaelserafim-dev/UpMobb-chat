import type { MenuItemProps } from "./MenuItem.ts";

export function MenuItem({
  label,
  action = "",
  danger = false,
  role = "menuitem",
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={`chat-more__item${danger ? " chat-more__item--danger" : ""}`}
      data-chat-action={action || undefined}
      data-menu-action={action || undefined}
      role={role}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
