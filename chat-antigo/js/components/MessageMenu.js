import { Icons } from "../icons.js";
import { REACTION_EMOJIS } from "../emojis.js";

export function MessageMenu({ canDelete = false } = {}) {
  return `
    <div class="msg-menu" id="msg-menu" hidden>
      <div class="msg-menu__reactions" role="group" aria-label="Reações">
        ${REACTION_EMOJIS.map(
          (item) => `
          <button
            type="button"
            class="msg-menu__emoji"
            data-action="react"
            data-emoji="${item.emoji}"
            title="${item.label}"
            aria-label="${item.label}"
          >${item.emoji}</button>
        `
        ).join("")}
      </div>

      <div class="msg-menu__card" role="menu">
        <button type="button" class="msg-menu__item" data-action="reply" role="menuitem">
          <span class="msg-menu__icon">${Icons.reply}</span>
          <span>Responder</span>
        </button>
        ${
          canDelete
            ? `
        <div class="msg-menu__divider" role="separator"></div>
        <button type="button" class="msg-menu__item msg-menu__item--danger" data-action="delete" role="menuitem">
          <span class="msg-menu__icon">${Icons.trash}</span>
          <span>Apagar</span>
        </button>
        `
            : ""
        }
      </div>
    </div>
  `;
}
