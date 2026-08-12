import { Icons } from "../icons.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function ChatInput({ pendingAttachments = [], replyTo = null } = {}) {
  const attachments = Array.isArray(pendingAttachments)
    ? pendingAttachments
    : pendingAttachments
      ? [pendingAttachments]
      : [];

  return `
    <div class="chat-composer-wrap" id="chat-composer-wrap">
      ${replyTo ? ReplyPreview(replyTo) : ""}
      ${
        attachments.length
          ? `
        <div class="composer-preview" id="composer-preview">
          <div class="composer-preview__list">
            ${attachments.map((a) => previewItem(a)).join("")}
          </div>
        </div>
      `
          : ""
      }

      <form class="chat-composer" id="chat-composer" autocomplete="off">
        <button type="button" class="composer-btn" aria-label="Anexar" id="composer-attach">
          ${Icons.plus}
        </button>

        <div
          class="composer-field is-empty"
          id="composer-field"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          aria-label="Mensagem"
          data-placeholder="Digite uma mensagem"
        ></div>

        <button type="submit" class="composer-send" aria-label="Enviar">
          ${Icons.send}
        </button>
        <input
          type="file"
          id="composer-file-input"
          class="composer-file-input"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          multiple
          hidden
        />
      </form>
    </div>
  `;
}

function ReplyPreview(reply) {
  return `
    <div class="composer-reply" id="composer-reply">
      <div class="composer-reply__bar"></div>
      <div class="composer-reply__body">
        <strong>${escapeHtml(reply.author || "Mensagem")}</strong>
        <span>${escapeHtml(replyPreviewText(reply))}</span>
      </div>
      <button type="button" class="composer-reply__remove" id="composer-reply-remove" aria-label="Cancelar resposta">
        ${Icons.x}
      </button>
    </div>
  `;
}

function replyPreviewText(reply) {
  if (reply.text?.trim()) return reply.text;
  if (reply.image) return "Foto";
  if (reply.video) return "Vídeo";
  if (reply.attachment) return reply.attachment.name || "Arquivo";
  return "Mensagem";
}

function previewItem(attachment) {
  const removeBtn = `
    <button
      type="button"
      class="composer-preview__remove"
      data-preview-remove="${escapeAttr(attachment.id)}"
      aria-label="Remover anexo"
    >${Icons.x}</button>
  `;

  if (attachment.kind === "image") {
    return `
      <div class="composer-preview__item" data-preview-id="${escapeAttr(attachment.id)}">
        <div class="composer-preview__media">
          <img src="${escapeAttr(attachment.src)}" alt="" />
        </div>
        ${removeBtn}
      </div>
    `;
  }

  if (attachment.kind === "video") {
    return `
      <div class="composer-preview__item" data-preview-id="${escapeAttr(attachment.id)}">
        <div class="composer-preview__media composer-preview__media--video">
          <video src="${escapeAttr(attachment.src)}" muted></video>
        </div>
        ${removeBtn}
      </div>
    `;
  }

  return `
    <div class="composer-preview__item composer-preview__item--file" data-preview-id="${escapeAttr(attachment.id)}">
      <div class="composer-preview__file">${escapeHtml(fileBadge(attachment))}</div>
      <div class="composer-preview__meta">
        <strong>${escapeHtml(attachment.name || "Arquivo")}</strong>
        <span>${escapeHtml(attachment.sizeLabel || "")}</span>
      </div>
      ${removeBtn}
    </div>
  `;
}

function fileBadge(attachment) {
  const ext = (attachment.name || "").split(".").pop()?.toUpperCase() || "FILE";
  return ext.slice(0, 4);
}


