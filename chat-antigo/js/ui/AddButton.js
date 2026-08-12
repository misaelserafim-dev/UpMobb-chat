import { Icons } from "../icons.js";
import { escapeAttr } from "../utils/escape.js";

export function AddButton({
  id = "",
  label = "Adicionar",
  title = "",
  className = "",
  type = "button",
} = {}) {
  const tip = title || label;
  const classes = ["add-btn", className].filter(Boolean).join(" ");
  return `
    <button
      type="${escapeAttr(type)}"
      class="${escapeAttr(classes)}"
      ${id ? `id="${escapeAttr(id)}"` : ""}
      aria-label="${escapeAttr(label)}"
      title="${escapeAttr(tip)}"
    >${Icons.plus}</button>
  `;
}
