import { Icons } from "../icons.js";

export function PageBackButton() {
  return `
    <button type="button" class="chat-window__back icon-btn" data-page-back aria-label="Voltar">
      ${Icons.chevronLeft}
    </button>
  `;
}
