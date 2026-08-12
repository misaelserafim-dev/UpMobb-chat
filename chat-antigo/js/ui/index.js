export { MenuItem } from "./MenuItem.js";
export { NavLink } from "./NavLink.js";
export { FilterChip } from "./FilterChip.js";
export { ChatItem } from "./ChatItem.js";
export { AddButton } from "./AddButton.js";
export { escapeHtml, escapeAttr } from "../utils/escape.js";
import { MenuItem } from "./MenuItem.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";
import { SYSTEM_COLORS, getSavedThemeId } from "../theme.js";

/**
 * Container genérico de submenu / dropdown
 */
export function SubMenu({
  id = "",
  title = "",
  className = "",
  hidden = true,
  role = "menu",
  children = "",
} = {}) {
  const idAttr = id ? `id="${escapeAttr(id)}"` : "";
  return `
    <div
      class="${escapeAttr(className)}"
      ${idAttr}
      ${hidden ? "hidden" : ""}
      role="${escapeAttr(role)}"
    >
      ${title ? `<div class="theme-picker__title">${escapeHtml(title)}</div>` : ""}
      ${children}
    </div>
  `;
}

/**
 * Menu de cores do sistema (theme picker)
 */
export function ThemePickerMenu({
  themeId = getSavedThemeId(),
  id = "theme-picker-menu",
  hidden = true,
  colors = SYSTEM_COLORS,
} = {}) {
  const swatches = colors
    .map((color) => {
      const icon = color.swatchImage
        ? `<img class="theme-picker__swatch-icon" src="${escapeAttr(color.swatchImage)}" alt="" />`
        : "";
      return `
        <button
          type="button"
          class="theme-picker__swatch ${color.swatchImage ? "theme-picker__swatch--icon" : ""} ${
            color.id === themeId ? "is-active" : ""
          }"
          style="--swatch: ${escapeAttr(color.background)}"
          data-theme-id="${escapeAttr(color.id)}"
          title="${escapeAttr(color.label)}"
          aria-label="${escapeAttr(color.label)}"
          role="menuitemradio"
          aria-checked="${color.id === themeId}"
        >${icon}</button>
      `;
    })
    .join("");

  return SubMenu({
    id,
    title: "Cores do sistema",
    className: "theme-picker__menu",
    hidden,
    role: "menu",
    children: `<div class="theme-picker__swatches">${swatches}</div>`,
  });
}

/**
 * Menu "mais opções" do chat
 */
export function ChatMoreMenu({
  id = "chat-more-menu",
  hidden = true,
  items = [
    { label: "Transferir", action: "transferir" },
    { label: "Retornar", action: "retornar" },
    { label: "Resolver", action: "resolver" },
    { label: "Deletar", action: "deletar", danger: true },
  ],
} = {}) {
  return `
    <div class="chat-more__menu" id="${escapeAttr(id)}" ${hidden ? "hidden" : ""} role="menu">
      ${items.map((item) => MenuItem(item)).join("")}
    </div>
  `;
}
