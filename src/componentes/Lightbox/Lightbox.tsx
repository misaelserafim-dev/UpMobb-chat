import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { LightboxProps } from "./Lightbox.ts";
import "./Lightbox.css";

export function Lightbox({ open, src, alt = "Imagem ampliada", onClose }: LightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!open || !src) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, src]);

  if (!open || !src) return null;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Zoom da imagem"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <button
        ref={closeBtnRef}
        type="button"
        className="lightbox__close"
        id="lightbox-close"
        aria-label="Fechar zoom"
        onClick={handleClose}
      >
        <Icons.X />
      </button>
      <img
        className="lightbox__img"
        id="lightbox-img"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
