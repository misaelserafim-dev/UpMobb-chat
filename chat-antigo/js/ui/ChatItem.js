import { escapeHtml, escapeAttr } from "../utils/escape.js";

/**
 * Item da lista de conversas
 */
export function ChatItem(chat = {}) {
  const meta = chat.unread
    ? `<span class="badge">${escapeHtml(String(chat.unread))}</span>`
    : "";
  const stripe = chat.color
    ? `style="border-left-color: ${escapeAttr(chat.color)}"`
    : "";

  return `
    <li
      class="chat-item ${chat.active ? "chat-item--active" : ""}"
      data-chat-id="${escapeAttr(chat.id)}"
      role="button"
      tabindex="0"
      ${stripe}
    >
      <div class="chat-item__avatar-wrap">
        <img class="avatar" src="${escapeAttr(chat.avatar)}" alt="" />
        ${TagBadge(chat.tag)}
      </div>
      <div class="chat-item__body">
        <div class="chat-item__top">
          <span class="chat-item__name">${escapeHtml(chat.name)}</span>
          <span class="chat-item__time">${escapeHtml(chat.time || "")}</span>
        </div>
        <div class="chat-item__bottom">
          <p class="chat-item__preview">${escapeHtml(chat.preview || "")}</p>
          ${meta}
        </div>
      </div>
    </li>
  `;
}

export function TagBadge(tag) {
  if (!tag) return "";

  if (tag.type === "icon" && tag.icon) {
    return `
      <span class="chat-tag chat-tag--icon" title="${escapeAttr(tag.label || "")}">
        <img src="${escapeAttr(tag.icon)}" alt="" />
      </span>
    `;
  }

  const color = tag.color || "#22c55e";
  return `
    <span
      class="chat-tag chat-tag--color"
      title="${escapeAttr(tag.label || "")}"
      style="background: ${escapeAttr(color)}"
    ></span>
  `;
}
