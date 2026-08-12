import { escapeAttr, escapeHtml } from "./escape.js";

export function initialLetter(name = "") {
  const trimmed = String(name).trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toLocaleUpperCase("pt-BR");
}

export function LetterAvatar({ name = "", status = "offline" } = {}) {
  const letter = initialLetter(name);
  const online = status === "online";
  const statusLabel = online ? "Online" : "Offline";

  return `
    <span
      class="letter-avatar"
      title="${escapeAttr(statusLabel)}"
      aria-label="${escapeAttr(`${name || "Membro"}, ${statusLabel}`)}"
    >
      <span class="letter-avatar__circle" aria-hidden="true">${escapeHtml(letter)}</span>
      <span
        class="letter-avatar__status ${online ? "is-online" : "is-offline"}"
        aria-hidden="true"
      ></span>
    </span>
  `;
}
