import { useEffect, useEffectEvent, useRef, useState, type TransitionEvent } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { ContactMediaItem, ContactPanelProps } from "./ContactPanel.ts";
import "./ContactPanel.css";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({
  kind,
  value,
  label,
  copied,
  onCopy,
}: {
  kind: "name" | "phone";
  value: string;
  label: string;
  copied: "name" | "phone" | null;
  onCopy: (kind: "name" | "phone", value: string) => void;
}) {
  const isCopied = copied === kind;

  return (
    <button
      type="button"
      className={`contact-panel__copy${isCopied ? " is-copied" : ""}`}
      aria-label={isCopied ? "Copiado" : label}
      title={isCopied ? "Copiado" : label}
      onClick={() => onCopy(kind, value)}
    >
      {isCopied ? <Icons.Checks /> : <Icons.Copy />}
      {isCopied ? (
        <span className="contact-panel__copied-tip" aria-live="polite">
          Copiado
        </span>
      ) : null}
    </button>
  );
}

function MediaThumb({
  item,
  onOpen,
}: {
  item: ContactMediaItem;
  onOpen: (item: ContactMediaItem) => void;
}) {
  if (item.kind === "image" && item.src) {
    return (
      <button type="button" className="contact-panel__thumb" onClick={() => onOpen(item)} title={item.name}>
        <img src={item.src} alt="" />
      </button>
    );
  }

  if (item.kind === "video") {
    return (
      <button type="button" className="contact-panel__thumb" onClick={() => onOpen(item)} title={item.name}>
        {item.poster ? <img src={item.poster} alt="" /> : <span className="contact-panel__thumb-fallback" />}
        <span className="contact-panel__thumb-play" aria-hidden="true">
          <Icons.Play />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="contact-panel__thumb contact-panel__thumb--file"
      onClick={() => onOpen(item)}
      title={item.name}
    >
      <span className="contact-panel__file-icon" aria-hidden="true">
        <Icons.Download size="sm" />
      </span>
    </button>
  );
}

export function ContactPanel({
  chat,
  phone,
  media = [],
  open = true,
  onClose,
  onExited,
  onOpenImage,
  onOpenDocument,
}: ContactPanelProps) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState<"name" | "phone" | null>(null);
  const copiedTimer = useRef(0);
  const displayPhone = (phone || chat.phone || "").trim();
  const preview = media.slice(0, 4);

  const notifyExited = useEffectEvent(() => {
    onExited?.();
  });

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setShown(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => notifyExited(), 420);
    return () => window.clearTimeout(t);
  }, [open]);

  function handleShellTransitionEnd(e: TransitionEvent<HTMLElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "width" && e.propertyName !== "transform") return;
    if (!open) notifyExited();
  }

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  async function handleCopy(kind: "name" | "phone", value: string) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(kind);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 700);
  }

  function handleMediaOpen(item: ContactMediaItem) {
    if (item.kind === "image" && item.src) {
      onOpenImage?.(item.src);
      return;
    }
    if (item.kind === "video" && item.src) {
      onOpenImage?.(item.poster || item.src);
      return;
    }
    if (item.kind === "file" && item.attachment) {
      onOpenDocument?.(item.attachment);
    }
  }

  return (
    <div
      className={`contact-panel-shell${shown ? " is-open" : ""}`}
      onTransitionEnd={handleShellTransitionEnd}
    >
      <aside className="contact-panel" aria-label={`Contato ${chat.name}`} aria-hidden={!shown}>
        <header className="contact-panel__header">
          <div className="contact-panel__title-row">
            <h2 className="contact-panel__title" title={chat.name}>
              {chat.name}
            </h2>
            <CopyButton
              kind="name"
              value={chat.name}
              label="Copiar nome"
              copied={copied}
              onCopy={handleCopy}
            />
          </div>
          <button
            type="button"
            className="contact-panel__close icon-btn"
            aria-label="Fechar painel do contato"
            onClick={onClose}
          >
            <Icons.X />
          </button>
        </header>

        <div className="contact-panel__body">
          <div className="contact-panel__avatar-wrap">
            {chat.avatar ? (
              <img className="contact-panel__avatar" src={chat.avatar} alt="" />
            ) : (
              <div className="contact-panel__avatar contact-panel__avatar--empty" aria-hidden="true">
                {(chat.name || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className={`contact-panel__phone-row${copied === "phone" ? " is-copied" : ""}`}>
            {displayPhone ? (
              <button
                type="button"
                className="contact-panel__phone"
                title={copied === "phone" ? "Copiado" : "Copiar telefone"}
                onClick={() => handleCopy("phone", displayPhone)}
              >
                {displayPhone}
              </button>
            ) : (
              <span className="contact-panel__phone contact-panel__phone--empty">
                Sem telefone cadastrado
              </span>
            )}
            {displayPhone ? (
              <CopyButton
                kind="phone"
                value={displayPhone}
                label="Copiar telefone"
                copied={copied}
                onCopy={handleCopy}
              />
            ) : null}
          </div>

          <section className="contact-panel__media" aria-label="Mídias, docs e links">
            <button type="button" className="contact-panel__media-head">
              {/* <span className="contact-panel__media-icon" aria-hidden="true">
                <Icons.Image />
              </span> */}
              <span className="contact-panel__media-title">Mídias, docs e links</span>
              <span className="contact-panel__media-count">{media.length}</span>
              <Icons.ChevronRight size="xs" />
            </button>

            {preview.length > 0 ? (
              <div className="contact-panel__thumbs">
                {preview.map((item) => (
                  <MediaThumb key={item.id} item={item} onOpen={handleMediaOpen} />
                ))}
              </div>
            ) : (
              <p className="contact-panel__media-empty">Nenhuma mídia nesta conversa.</p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
