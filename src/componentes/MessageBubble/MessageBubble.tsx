import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { MessageBubbleProps } from "./MessageBubble.ts";
import "./MessageBubble.css";

function replyPreview(reply: NonNullable<ChatMessage["replyTo"]>) {
  if (reply.text?.trim()) return reply.text;
  if (reply.image) return "Foto";
  if (reply.video) return "Vídeo";
  if (reply.attachment) return reply.attachment.name || "Arquivo";
  return "Mensagem";
}

export function MessageBubble({
  message,
  senderName = "",
  className = "",
  onImageClick,
  onContextMenu,
}: MessageBubbleProps) {
  const isOut = message.from === "out";
  const hasText = Boolean(message.html?.trim() || message.text?.trim());
  const showName = !isOut && senderName;
  const isRead = Boolean(message.read);
  const reactions = message.reactions || [];

  return (
    <div
      className={`message message--${isOut ? "out" : "in"}${reactions.length ? " message--has-reactions" : ""}${className ? ` ${className}` : ""}`}
      data-message-id={message.id}
      data-from={isOut ? "out" : "in"}
      onContextMenu={onContextMenu}
    >
      <div
        className={`message__bubble${message.image || message.video ? " message__bubble--media" : ""}`}
      >
        {showName ? <div className="message__sender">{senderName}</div> : null}

        {message.replyTo ? (
          <div className="message__quote">
            <div className="message__quote-author">{message.replyTo.author || ""}</div>
            <div className="message__quote-text">{replyPreview(message.replyTo)}</div>
          </div>
        ) : null}

        {message.forwarded ? (
          <div className="message__forwarded">
            <Icons.Forward /> Encaminhada
          </div>
        ) : null}

        {message.image ? (
          <button
            type="button"
            className="message__media message__media--image"
            aria-label="Ampliar imagem"
            onClick={() => onImageClick?.(message.image!.src)}
          >
            <img src={message.image.src} alt={message.image.alt || "Imagem"} />
            <span className="message__media-hint">Clique para zoom</span>
          </button>
        ) : null}

        {message.video ? (
          <div className="message__media message__media--video">
            <video
              controls
              preload="metadata"
              poster={message.video.poster || ""}
              src={message.video.src}
            />
          </div>
        ) : null}

        {message.attachment ? (
          <div className="message__attachment">
            <div className="attachment__icon">
              {message.attachment.type === "pdf" ? "PDF" : "FILE"}
            </div>
            <div className="attachment__info">
              <div className="attachment__name">{message.attachment.name}</div>
              <div className="attachment__meta">
                {[message.attachment.size, message.attachment.pages].filter(Boolean).join(" · ")}
              </div>
            </div>
            <a
              className="attachment__download"
              href={message.attachment.url || "#"}
              download={message.attachment.name}
              aria-label={`Baixar ${message.attachment.name}`}
              title="Download"
            >
              <Icons.Download />
            </a>
          </div>
        ) : null}

        {hasText ? (
          message.html ? (
            <div className="message__text" dangerouslySetInnerHTML={{ __html: message.html }} />
          ) : (
            <div className="message__text">{message.text}</div>
          )
        ) : null}

        <span className="message__meta">
          <span className="message__time">{message.time}</span>
          {isOut ? (
            <span
              className={`message__checks${isRead ? " message__checks--read" : ""}`}
              title={isRead ? "Visualizado" : "Entregue"}
              aria-label={isRead ? "Visualizado" : "Entregue"}
            >
              <Icons.Checks />
            </span>
          ) : null}
        </span>
      </div>

      {reactions.length ? (
        <div className="message__reactions" aria-label="Reações">
          {reactions.map((r) => (
            <span className="message__reaction" title={r.emoji} key={`${r.emoji}-${r.count}`}>
              <span className="message__reaction-emoji">{r.emoji}</span>
              {r.count > 1 ? <span className="message__reaction-count">{r.count}</span> : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
