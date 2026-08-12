import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";
import type { ConfirmModalProps } from "./ConfirmModal.ts";
import "./ConfirmModal.css";

export function ConfirmModal({
  open = false,
  title = "",
  description = "",
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleCancel = useEffectEvent(() => {
    onCancel?.();
  });

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-modal" role="presentation">
      <div className="confirm-modal__backdrop" onClick={handleCancel} />
      <div
        className="confirm-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <h2 className="confirm-modal__title" id="confirm-modal-title">
          {title}
        </h2>
        <p className="confirm-modal__desc" id="confirm-modal-desc">
          {description}
        </p>
        <div className="confirm-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-modal__btn confirm-modal__btn--ghost"
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal__btn${danger ? " confirm-modal__btn--danger" : " confirm-modal__btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
