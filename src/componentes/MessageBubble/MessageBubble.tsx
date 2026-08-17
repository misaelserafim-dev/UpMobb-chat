import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { ChatMessage } from "@/utils/chatData.ts";
import { getDocumentBadge, getDocumentKind } from "@/utils/documentPreview.ts";
import type { MessageBubbleProps } from "./MessageBubble.ts";
import "./MessageBubble.css";

function replyPreview(reply: NonNullable<ChatMessage["replyTo"]>) {
  if (reply.text?.trim()) return reply.text;
  if (reply.image) return "Foto";
  if (reply.video) return "Vídeo";
  if (reply.audio) return "Áudio";
  if (reply.attachment) return reply.attachment.name || "Arquivo";
  return "Mensagem";
}

function formatAudioClock(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const AUDIO_WAVE = [
  8, 14, 22, 12, 28, 16, 24, 10, 20, 30, 18, 26, 12, 22, 32, 14, 24, 18, 28, 11, 20,
  26, 15, 30, 19, 23, 13, 27, 17, 25, 10, 21, 29, 16, 24, 12, 22, 18, 26, 14,
];

function MessageAudio({
  src,
  durationSec = 0,
  isOut,
  avatar,
}: {
  src: string;
  durationSec?: number;
  isOut: boolean;
  avatar?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    function onTime() {
      const d = el!.duration;
      const t = el!.currentTime;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        setProgress(t / d);
      }
      setCurrent(t);
    }

    function onEnded() {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
    }

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [src]);

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
    setProgress(ratio);
  }

  const avatarNode = (
    <div className="message__audio-avatar" aria-hidden="true">
      {avatar ? (
        <img src={avatar} alt="" />
      ) : (
        <span className="message__audio-avatar-fallback">
          <Icons.Contact size="sm" />
        </span>
      )}
      <span className="message__audio-mic">
        <Icons.Mic size="xs" />
      </span>
    </div>
  );

  return (
    <div className={`message__audio${isOut ? " message__audio--out" : " message__audio--in"}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      {isOut ? avatarNode : null}
      <button
        type="button"
        className="message__audio-play"
        aria-label={playing ? "Pausar áudio" : "Ouvir áudio"}
        onClick={() => void toggle()}
      >
        {playing ? <Icons.Pause size="sm" /> : <Icons.Play size="sm" />}
      </button>
      <div className="message__audio-main">
        <div
          className="message__audio-wave"
          role="slider"
          aria-label="Progresso do áudio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          onClick={seek}
        >
          {AUDIO_WAVE.map((h, i) => {
            const played = i / AUDIO_WAVE.length <= progress;
            return (
              <span
                key={i}
                className={`message__audio-bar${played ? " is-played" : ""}`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <span className="message__audio-time">
          {formatAudioClock(playing || current > 0 ? current : duration)}
        </span>
      </div>
      {!isOut ? avatarNode : null}
    </div>
  );
}

export function MessageBubble({
  message,
  senderName = "",
  senderAvatar,
  className = "",
  onImageClick,
  onDocumentClick,
  onContextMenu,
}: MessageBubbleProps) {
  const isOut = message.from === "out";
  const hasText = Boolean(message.html?.trim() || message.text?.trim());
  const showName = !isOut && senderName;
  const isRead = Boolean(message.read);
  const reactions = message.reactions || [];
  const attachment = message.attachment;
  const docKind = attachment
    ? getDocumentKind({ name: attachment.name, type: attachment.type })
    : null;
  const docBadge = attachment && docKind ? getDocumentBadge(docKind, attachment.name) : "FILE";
  const audioOnly =
    Boolean(message.audio) && !hasText && !message.image && !message.video && !attachment;

  return (
    <div
      className={`message message--${isOut ? "out" : "in"}${reactions.length ? " message--has-reactions" : ""}${className ? ` ${className}` : ""}`}
      data-message-id={message.id}
      data-from={isOut ? "out" : "in"}
      onContextMenu={onContextMenu}
    >
      <div
        className={`message__bubble${message.image || message.video ? " message__bubble--media" : ""}${audioOnly ? " message__bubble--audio" : ""}`}
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

        {message.audio ? (
          <MessageAudio
            src={message.audio.src}
            durationSec={message.audio.durationSec}
            isOut={isOut}
            avatar={senderAvatar}
          />
        ) : null}

        {attachment ? (
          <div className="message__attachment">
            <button
              type="button"
              className="attachment__preview-btn"
              aria-label={`Pré-visualizar ${attachment.name}`}
              onClick={() =>
                onDocumentClick?.({
                  url: attachment.url || "#",
                  name: attachment.name,
                  size: attachment.size,
                  pages: attachment.pages,
                  type: attachment.type,
                })
              }
            >
              <div className="attachment__icon">{docBadge}</div>
              <div className="attachment__info">
                <div className="attachment__name">{attachment.name}</div>
                <div className="attachment__meta">
                  {[attachment.size, attachment.pages].filter(Boolean).join(" · ") ||
                    "Clique para pré-visualizar"}
                </div>
              </div>
            </button>
            <a
              className="attachment__download"
              href={attachment.url || "#"}
              download={attachment.name}
              aria-label={`Baixar ${attachment.name}`}
              title="Download"
              onClick={(e) => e.stopPropagation()}
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
