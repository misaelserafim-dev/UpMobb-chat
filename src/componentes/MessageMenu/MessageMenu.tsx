import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import { REACTION_EMOJIS } from "@/utils/emojis.ts";
import type { MessageMenuProps } from "./MessageMenu.ts";
import "./MessageMenu.css";

export function MessageMenu({
  open,
  x,
  y,
  canDelete = false,
  onClose,
  onAction,
}: MessageMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useDismissable({ open, onDismiss: onClose, refs: [menuRef] });

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const pad = 8;
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - pad) {
      left = window.innerWidth - rect.width - pad;
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - rect.height - pad;
    }
    setPos({ left: Math.max(pad, left), top: Math.max(pad, top) });
  }, [open, x, y, canDelete]);

  useLayoutEffect(() => {
    if (!open) return;
    function onScroll() {
      onClose();
    }
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="msg-menu"
      id="msg-menu"
      style={{ left: pos.left, top: pos.top }}
      role="presentation"
    >
      <div className="msg-menu__reactions" role="group" aria-label="Reações">
        {REACTION_EMOJIS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="msg-menu__emoji"
            title={item.label}
            aria-label={item.label}
            onClick={() => onAction("react", item.emoji)}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      <div className="msg-menu__card" role="menu">
        <button
          type="button"
          className="msg-menu__item"
          role="menuitem"
          onClick={() => onAction("reply")}
        >
          <span className="msg-menu__icon">
            <Icons.Reply />
          </span>
          <span>Responder</span>
        </button>

        {canDelete ? (
          <>
            <div className="msg-menu__divider" role="separator" />
            <button
              type="button"
              className="msg-menu__item msg-menu__item--danger"
              role="menuitem"
              onClick={() => onAction("delete")}
            >
              <span className="msg-menu__icon">
                <Icons.Trash />
              </span>
              <span>Apagar</span>
            </button>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
