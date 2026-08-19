import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { ChatItemData, ChatItemProps, ChatTag } from "./ChatItem.ts";
import "./ChatItem.css";

const DRAG_HOLD_MS = 160;
const DRAG_MOVE_PX = 12;

function TagBadge({ tag }: { tag?: ChatTag }) {
  if (!tag) return null;

  if (tag.type === "icon" && tag.icon) {
    return (
      <span className="chat-tag chat-tag--icon" title={tag.label || ""}>
        <img src={tag.icon} alt="" />
      </span>
    );
  }

  return (
    <span
      className="chat-tag chat-tag--color"
      title={tag.label || ""}
      style={{ background: tag.color || "#22c55e" }}
    />
  );
}

function clearChatDropClasses() {
  document.getElementById("chat-empty")?.classList.remove(
    "is-chat-drop-target",
    "is-chat-drop-hover",
    "is-drop-target",
    "is-drop-hover",
  );
  document.getElementById("chat-window")?.classList.remove(
    "is-chat-drop-target",
    "is-chat-drop-hover",
  );
}

function getChatDropZone(x: number, y: number) {
  const top = document.elementFromPoint(x, y);
  if (!(top instanceof Element)) return null;
  const zone = top.closest<HTMLElement>("#chat-empty, #chat-window");
  if (!zone) return null;
  if (zone.id === "chat-empty" && zone.classList.contains("chat-empty--loading")) return null;
  return zone;
}

function setChatDropHover(x: number, y: number) {
  const empty = document.getElementById("chat-empty");
  const win = document.getElementById("chat-window");
  empty?.classList.remove("is-chat-drop-hover", "is-drop-hover");
  win?.classList.remove("is-chat-drop-hover");

  const zone = getChatDropZone(x, y);
  if (!zone) return;
  zone.classList.add("is-chat-drop-hover");
  if (zone.id === "chat-empty") zone.classList.add("is-drop-hover");
}

export function ChatItem({
  chat,
  onClick,
  morphIndex = 0,
  morphPhase = "idle",
  onDropOnEmpty,
}: ChatItemProps) {
  const rootRef = useRef<HTMLLIElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    active: false,
    holdTimer: 0,
    moved: false,
  });
  const [dragging, setDragging] = useState(false);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  const style = {
    ...(chat.color ? { borderLeftColor: chat.color } : {}),
    ...(morphPhase === "settle" && !chat.active
      ? { ["--morph-delay" as string]: `${morphIndex * 16}ms` }
      : {}),
  } as CSSProperties;

  function clearHold() {
    const d = dragRef.current;
    if (d.holdTimer) {
      window.clearTimeout(d.holdTimer);
      d.holdTimer = 0;
    }
  }

  function beginDrag(clientX: number, clientY: number) {
    const d = dragRef.current;
    if (d.active) return;
    d.active = true;
    d.moved = true;
    document.body.classList.add("is-dragging-chat");
    document.getElementById("chat-empty")?.classList.add("is-chat-drop-target", "is-drop-target");
    document.getElementById("chat-window")?.classList.add("is-chat-drop-target");
    setDragging(true);
    setGhost({ x: clientX, y: clientY });
    setChatDropHover(clientX, clientY);
    try {
      rootRef.current?.setPointerCapture(d.pointerId);
    } catch {
      /* ignore */
    }
  }

  function endDrag(clientX: number, clientY: number) {
    const d = dragRef.current;
    clearHold();
    const wasDragging = d.active;
    const pointerId = d.pointerId;
    d.pointerId = -1;
    d.active = false;

    try {
      if (pointerId >= 0) rootRef.current?.releasePointerCapture(pointerId);
    } catch {
      /* ignore */
    }

    document.body.classList.remove("is-dragging-chat");
    clearChatDropClasses();
    setDragging(false);
    setGhost(null);

    if (wasDragging && getChatDropZone(clientX, clientY)) {
      onDropOnEmpty?.(chat.id);
    }
    // moved permanece true até o click ser engolido (ou próximo pointerdown)
  }

  function onPointerDown(e: PointerEvent<HTMLLIElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const d = dragRef.current;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.active = false;
    d.moved = false;
    clearHold();
    d.holdTimer = window.setTimeout(() => {
      beginDrag(d.startX, d.startY);
    }, DRAG_HOLD_MS);
  }

  function onPointerMove(e: PointerEvent<HTMLLIElement>) {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.active) {
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      // Scroll vertical da lista → cancela hold
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        clearHold();
        d.pointerId = -1;
        return;
      }
      if (Math.hypot(dx, dy) >= DRAG_MOVE_PX) {
        clearHold();
        beginDrag(e.clientX, e.clientY);
      }
      return;
    }

    e.preventDefault();
    setGhost({ x: e.clientX, y: e.clientY });
    setChatDropHover(e.clientX, e.clientY);
  }

  function onPointerUp(e: PointerEvent<HTMLLIElement>) {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId && d.pointerId !== -1) return;
    endDrag(e.clientX, e.clientY);
  }

  function handleClick() {
    if (dragRef.current.moved || dragging) {
      dragRef.current.moved = false;
      return;
    }
    onClick?.();
  }

  return (
    <>
      <li
        ref={rootRef}
        className={`chat-item${chat.active ? " chat-item--active" : ""}${dragging ? " is-dragging" : ""}`}
        data-chat-id={chat.id}
        role="button"
        tabIndex={0}
        title={chat.preview || undefined}
        style={style}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => endDrag(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div className="chat-item__avatar-wrap">
          <img className="avatar" src={chat.avatar} alt="" draggable={false} />
          <TagBadge tag={chat.tag} />
        </div>
        <div className="chat-item__body">
          <div className="chat-item__top">
            <span className="chat-item__name">{chat.name}</span>
            <span className="chat-item__time">{chat.time || ""}</span>
          </div>
          <div className="chat-item__bottom">
            <p className="chat-item__preview">{chat.preview || ""}</p>
            {chat.unread ? <span className="badge">{chat.unread}</span> : null}
          </div>
        </div>
      </li>

      {ghost
        ? createPortal(
            <div
              className={`chat-drag-ghost${!chat.avatar ? " chat-drag-ghost--fallback" : ""}`}
              style={{ left: ghost.x, top: ghost.y }}
              aria-hidden="true"
            >
              {chat.avatar ? (
                <img src={chat.avatar} alt="" />
              ) : (
                <span>{(chat.name || "?").slice(0, 1).toUpperCase()}</span>
              )}
              {chat.unread ? <span className="chat-drag-ghost__badge">{chat.unread}</span> : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export type { ChatItemData };
