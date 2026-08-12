import { Icons } from "../icons.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function MessageBubble(message, { senderName = "" } = {}) {
  const isOut = message.from === "out";
  const hasText = Boolean(
    message.html?.trim() || message.text?.trim()
  );
  const showName = !isOut && senderName;
  const isRead = Boolean(message.read);
  const reactions = message.reactions || [];

  return `
    <div
      class="message message--${isOut ? "out" : "in"} ${reactions.length ? "message--has-reactions" : ""}"
      data-message-id="${escapeAttr(message.id)}"
      data-from="${isOut ? "out" : "in"}"
    >
      <div class="message__bubble ${message.image || message.video ? "message__bubble--media" : ""}">
        ${showName ? `<div class="message__sender">${escapeHtml(senderName)}</div>` : ""}
        ${message.replyTo ? ReplyQuote(message.replyTo) : ""}
        ${message.forwarded ? `<div class="message__forwarded">${Icons.forward} Encaminhada</div>` : ""}
        ${message.image ? ImageBlock(message.image) : ""}
        ${message.video ? VideoBlock(message.video) : ""}
        ${message.attachment ? AttachmentCard(message.attachment) : ""}
        ${
          hasText
            ? `<div class="message__text">${
                message.html ? message.html : escapeHtml(message.text)
              }</div>`
            : ""
        }
        <span class="message__meta">
          <span class="message__time">${message.time}</span>
          ${isOut ? Checks(isRead) : ""}
        </span>
      </div>
      ${reactions.length ? Reactions(reactions) : ""}
    </div>
  `;
}

function ReplyQuote(reply) {
  return `
    <div class="message__quote">
      <div class="message__quote-author">${escapeHtml(reply.author || "")}</div>
      <div class="message__quote-text">${escapeHtml(replyPreview(reply))}</div>
    </div>
  `;
}

function replyPreview(reply) {
  if (reply.text?.trim()) return reply.text;
  if (reply.image) return "Foto";
  if (reply.video) return "Vídeo";
  if (reply.attachment) return reply.attachment.name || "Arquivo";
  return "Mensagem";
}

function Reactions(reactions) {
  return `
    <div class="message__reactions" aria-label="Reações">
      ${reactions
        .map(
          (r) => `
        <span class="message__reaction" title="${escapeAttr(r.emoji)}">
          <span class="message__reaction-emoji">${r.emoji}</span>
          ${r.count > 1 ? `<span class="message__reaction-count">${r.count}</span>` : ""}
        </span>
      `
        )
        .join("")}
    </div>
  `;
}

function Checks(isRead) {
  const label = isRead ? "Visualizado" : "Entregue";
  return `
    <span
      class="message__checks ${isRead ? "message__checks--read" : ""}"
      title="${label}"
      aria-label="${label}"
    >${Icons.checks}</span>
  `;
}

function ImageBlock(image) {
  return `
    <button type="button" class="message__media message__media--image" data-lightbox="${escapeAttr(image.src)}" aria-label="Ampliar imagem">
      <img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || "Imagem")}" />
      <span class="message__media-hint">Clique para zoom</span>
    </button>
  `;
}

function VideoBlock(video) {
  return `
    <div class="message__media message__media--video">
      <video
        controls
        preload="metadata"
        poster="${escapeAttr(video.poster || "")}"
        src="${escapeAttr(video.src)}"
      ></video>
    </div>
  `;
}

function AttachmentCard(file) {
  const href = file.url || "#";
  return `
    <div class="message__attachment">
      <div class="attachment__icon">${file.type === "pdf" ? "PDF" : "FILE"}</div>
      <div class="attachment__info">
        <div class="attachment__name">${escapeHtml(file.name)}</div>
        <div class="attachment__meta">${escapeHtml([file.size, file.pages].filter(Boolean).join(" · "))}</div>
      </div>
      <a
        class="attachment__download"
        href="${escapeAttr(href)}"
        download="${escapeAttr(file.name)}"
        aria-label="Baixar ${escapeAttr(file.name)}"
        title="Download"
      >${Icons.download}</a>
    </div>
  `;
}


