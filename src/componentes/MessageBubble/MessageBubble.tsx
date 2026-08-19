import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { ChatMessage } from "@/utils/chatData.ts";
import { getDocumentBadge, getDocumentKind } from "@/utils/documentPreview.ts";
import type { MessageBubbleProps } from "./MessageBubble.ts";
import "./MessageBubble.css";

const SWIPE_THRESHOLD = 56;
const SWIPE_MAX = 72;
const SWIPE_AXIS_LOCK = 8;
const DELETE_THRESHOLD = 64;
const DELETE_MAX = 88;

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
  onReply,
  onDelete,
  onQuoteClick,
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

  const canSwipeReply = Boolean(onReply);
  const canSwipeDelete = Boolean(onDelete) && isOut;

  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    axis: null as null | "h" | "v" | "scroll",
    dx: 0,
    dy: 0,
    armed: false,
  });
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const preferReduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function clampSwipeX(raw: number) {
    if (isOut) return Math.max(-SWIPE_MAX, Math.min(0, raw));
    return Math.max(0, Math.min(SWIPE_MAX, raw));
  }

  function clampSwipeY(raw: number) {
    // só pra cima (valores negativos)
    return Math.max(-DELETE_MAX, Math.min(0, raw));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (preferReduce) return;
    if (!canSwipeReply && !canSwipeDelete) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const t = e.target as HTMLElement;
    if (t.closest("button, a, video, input, textarea, [role='slider'], .message__quote")) return;

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      dx: 0,
      dy: 0,
      armed: false,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (preferReduce || d.pointerId !== e.pointerId) return;

    const rawX = e.clientX - d.startX;
    const rawY = e.clientY - d.startY;

    if (!d.axis) {
      if (Math.abs(rawX) < SWIPE_AXIS_LOCK && Math.abs(rawY) < SWIPE_AXIS_LOCK) return;

      if (Math.abs(rawX) >= Math.abs(rawY)) {
        if (!canSwipeReply) {
          d.axis = "scroll";
          return;
        }
        d.axis = "h";
      } else if (rawY < 0 && canSwipeDelete) {
        d.axis = "v";
      } else {
        d.axis = "scroll";
        return;
      }

      try {
        rootRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setSwiping(true);
    }

    if (d.axis === "scroll") return;

    e.preventDefault();

    if (d.axis === "h") {
      const dx = clampSwipeX(rawX);
      d.dx = dx;
      d.dy = 0;
      const progress = Math.abs(dx) / SWIPE_THRESHOLD;
      if (!d.armed && progress >= 1) {
        d.armed = true;
        try {
          navigator.vibrate?.(10);
        } catch {
          /* ignore */
        }
      } else if (d.armed && progress < 0.85) {
        d.armed = false;
      }
      setOffsetX(dx);
      setOffsetY(0);
      return;
    }

    // vertical delete
    const dy = clampSwipeY(rawY);
    d.dy = dy;
    d.dx = 0;
    const progress = Math.abs(dy) / DELETE_THRESHOLD;
    if (!d.armed && progress >= 1) {
      d.armed = true;
      try {
        navigator.vibrate?.(12);
      } catch {
        /* ignore */
      }
    } else if (d.armed && progress < 0.85) {
      d.armed = false;
    }
    setOffsetY(dy);
    setOffsetX(0);
  }

  function endSwipe(e: PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;

    const shouldReply = d.axis === "h" && Math.abs(d.dx) >= SWIPE_THRESHOLD;
    const shouldDelete = d.axis === "v" && Math.abs(d.dy) >= DELETE_THRESHOLD;
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    d.pointerId = -1;
    d.axis = null;
    d.dx = 0;
    d.dy = 0;
    d.armed = false;
    setSwiping(false);
    setOffsetX(0);
    setOffsetY(0);
    if (shouldDelete) {
      onDelete?.();
      return;
    }
    if (shouldReply) onReply?.();
  }

  const replyProgress = Math.min(1, Math.abs(offsetX) / SWIPE_THRESHOLD);
  const deleteProgress = Math.min(1, Math.abs(offsetY) / DELETE_THRESHOLD);
  const lidOpen = deleteProgress * 42;
  const hasTransform = offsetX !== 0 || offsetY !== 0;

  return (
    <div
      ref={rootRef}
      className={`message message--${isOut ? "out" : "in"}${reactions.length ? " message--has-reactions" : ""}${swiping ? " is-swiping" : ""}${deleteProgress > 0 ? " is-deleting" : ""}${className ? ` ${className}` : ""}`}
      data-message-id={message.id}
      data-from={isOut ? "out" : "in"}
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endSwipe}
      onPointerCancel={endSwipe}
      style={
        hasTransform
          ? {
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              ["--delete-p" as string]: String(deleteProgress),
            }
          : undefined
      }
    >
      {canSwipeReply && !preferReduce ? (
        <span
          className={`message__swipe-reply${replyProgress >= 1 ? " is-armed" : ""}`}
          aria-hidden="true"
          style={{
            opacity: replyProgress,
            transform: `translate(${-offsetX}px, ${-offsetY}px) scale(${0.55 + replyProgress * 0.45})`,
          }}
        >
          <Icons.Reply size="sm" />
        </span>
      ) : null}

      {canSwipeDelete && !preferReduce ? (
        <span
          className={`message__swipe-delete${deleteProgress >= 1 ? " is-armed" : ""}`}
          aria-hidden="true"
          style={{
            opacity: Math.min(1, deleteProgress * 1.35),
            transform: `scale(${0.7 + deleteProgress * 0.4})`,
          }}
        >
          <svg className="message__trash" viewBox="0 0 24 28" aria-hidden="true">
            <g
              className="message__trash-lid"
              style={{
                transform: `rotate(${-lidOpen}deg)`,
                transformOrigin: "7px 7px",
              }}
            >
              <path d="M9 3h6" />
              <path d="M4 7h16" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </g>
            <g className="message__trash-body">
              <path d="M6 7h12v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
              <path d="M10 12v8" />
              <path d="M14 12v8" />
            </g>
          </svg>
        </span>
      ) : null}
      <div
        className={`message__bubble${message.image || message.video ? " message__bubble--media" : ""}${audioOnly ? " message__bubble--audio" : ""}`}
      >
        {showName ? <div className="message__sender">{senderName}</div> : null}

        {message.replyTo ? (
          <button
            type="button"
            className={`message__quote${message.replyTo.messageId && onQuoteClick ? " message__quote--link" : ""}`}
            aria-label="Ir para mensagem original"
            disabled={!message.replyTo.messageId || !onQuoteClick}
            onClick={(e) => {
              e.stopPropagation();
              const id = message.replyTo?.messageId;
              if (id) onQuoteClick?.(id);
            }}
          >
            <div className="message__quote-author">{message.replyTo.author || ""}</div>
            <div className="message__quote-text">{replyPreview(message.replyTo)}</div>
          </button>
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
