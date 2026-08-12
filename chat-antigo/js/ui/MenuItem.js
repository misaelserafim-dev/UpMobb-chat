import { escapeHtml, escapeAttr } from "../utils/escape.js";

/**
 * Item de menu reutilizável (chat-more, menus em geral)
 */
export function MenuItem({
  label,
  action = "",
  danger = false,
  role = "menuitem",
  attrs = "",
} = {}) {
  const actionAttr = action
    ? `data-chat-action="${escapeAttr(action)}" data-menu-action="${escapeAttr(action)}"`
    : "";

  return `
    <button
      type="button"
      class="chat-more__item ${danger ? "chat-more__item--danger" : ""}"
      ${actionAttr}
      role="${escapeAttr(role)}"
      ${attrs}
    >${escapeHtml(label)}</button>
  `;
}
