import { useState } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import type { ContactMediaItem, ContactPanelProps } from "./ContactPanel.ts";
import { mockPhoneFromChatId } from "./ContactPanel.ts";
import "./ContactPanel.css";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
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
  onClose,
  onEdit,
  onOpenImage,
  onOpenDocument,
}: ContactPanelProps) {
  const [copied, setCopied] = useState<"name" | "phone" | null>(null);
  const displayPhone = phone || mockPhoneFromChatId(chat.id);
  const preview = media.slice(0, 4);

  async function handleCopy(kind: "name" | "phone", value: string) {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1200);
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
    <aside className="contact-panel" aria-label={`Contato ${chat.name}`}>
      <header className="contact-panel__header">
        <div className="contact-panel__title-row">
          <h2 className="contact-panel__title" title={chat.name}>
            {chat.name}
          </h2>
          <button
            type="button"
            className="contact-panel__copy"
            aria-label="Copiar nome"
            title={copied === "name" ? "Copiado" : "Copiar nome"}
            onClick={() => handleCopy("name", chat.name)}
          >
            <Icons.Copy />
          </button>
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

        <div className="contact-panel__phone-row">
          <span className="contact-panel__phone">{displayPhone}</span>
          <button
            type="button"
            className="contact-panel__copy"
            aria-label="Copiar telefone"
            title={copied === "phone" ? "Copiado" : "Copiar telefone"}
            onClick={() => handleCopy("phone", displayPhone)}
          >
            <Icons.Copy />
          </button>
        </div>

        <button type="button" className="contact-panel__edit" onClick={onEdit}>
          Editar Contato
        </button>

        <section className="contact-panel__media" aria-label="Mídias, docs e links">
          <button type="button" className="contact-panel__media-head">
            <span className="contact-panel__media-icon" aria-hidden="true">
              <Icons.Image />
            </span>
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
  );
}
