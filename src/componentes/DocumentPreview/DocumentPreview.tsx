import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import {
  canInlinePreview,
  getDocumentBadge,
  getDocumentKind,
  getDocumentPreviewLabel,
} from "@/utils/documentPreview.ts";
import type { DocumentPreviewProps } from "./DocumentPreview.ts";
import "./DocumentPreview.css";

export function DocumentPreview({ open, file, onClose }: DocumentPreviewProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textStatus, setTextStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleClose = useEffectEvent(() => {
    onClose();
  });

  const kind = file ? getDocumentKind(file) : "other";
  const badge = file ? getDocumentBadge(kind, file.name) : "FILE";
  const sub = [file?.size, file?.pages].filter(Boolean).join(" · ");

  useEffect(() => {
    if (!open || !file) return;

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
  }, [open, file]);

  useEffect(() => {
    if (!open || !file || kind !== "text") {
      setTextContent(null);
      setTextStatus("idle");
      return;
    }

    let cancelled = false;
    setTextStatus("loading");
    setTextContent(null);

    fetch(file.url)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const text = await res.text();
        if (!cancelled) {
          setTextContent(text);
          setTextStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTextContent(null);
          setTextStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, file, kind]);

  if (!open || !file) return null;

  const inline = canInlinePreview(kind);

  return createPortal(
    <div
      className="document-preview"
      role="dialog"
      aria-modal="true"
      aria-label={getDocumentPreviewLabel(kind)}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="document-preview__panel" onClick={(e) => e.stopPropagation()}>
        <header className="document-preview__header">
          <div className="document-preview__badge" aria-hidden="true">
            {badge}
          </div>
          <div className="document-preview__meta">
            <div className="document-preview__name">{file.name}</div>
            {sub ? <div className="document-preview__sub">{sub}</div> : null}
          </div>
          <div className="document-preview__actions">
            <a
              className="document-preview__action document-preview__action--accent"
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              aria-label={`Baixar ${file.name}`}
              title="Download"
            >
              <Icons.Download />
            </a>
            <button
              ref={closeBtnRef}
              type="button"
              className="document-preview__action"
              aria-label="Fechar pré-visualização"
              onClick={handleClose}
            >
              <Icons.X />
            </button>
          </div>
        </header>

        <div className="document-preview__body">
          {kind === "pdf" ? (
            <iframe
              className="document-preview__frame"
              title={file.name}
              src={file.url}
            />
          ) : null}

          {kind === "text" ? (
            textStatus === "loading" ? (
              <div className="document-preview__status">Carregando…</div>
            ) : textStatus === "error" ? (
              <div className="document-preview__status document-preview__status--error">
                Não foi possível ler este arquivo.
              </div>
            ) : (
              <pre className="document-preview__text">{textContent}</pre>
            )
          ) : null}

          {!inline ? (
            <div className="document-preview__fallback">
              <div className="document-preview__fallback-card">
                <div className="document-preview__badge" aria-hidden="true">
                  {badge}
                </div>
                <p>
                  {kind === "word"
                    ? "Pré-visualização inline de DOC/DOCX não está disponível neste navegador. Abra ou baixe o arquivo."
                    : "Este tipo de arquivo não tem pré-visualização. Abra ou baixe para visualizar."}
                </p>
                <a
                  className="document-preview__fallback-link"
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icons.Download />
                  Abrir / baixar
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
