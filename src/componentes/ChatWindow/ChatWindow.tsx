import { useEffect, useEffectEvent, useRef, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/componentes/ChatInput/ChatInput.tsx";
import type { ReplyDraft } from "@/componentes/ChatInput/ChatInput.ts";
import { ChatMoreMenu } from "@/componentes/ChatMoreMenu/ChatMoreMenu.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import {
  ContactPanel,
} from "@/componentes/ContactPanel/ContactPanel.tsx";
import { collectChatMedia } from "@/componentes/ContactPanel/ContactPanel.ts";
import { DocumentPreview } from "@/componentes/DocumentPreview/DocumentPreview.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { Lightbox } from "@/componentes/Lightbox/Lightbox.tsx";
import { MessageBubble } from "@/componentes/MessageBubble/MessageBubble.tsx";
import { MessageMenu } from "@/componentes/MessageMenu/MessageMenu.tsx";
import type { MessageMenuAction } from "@/componentes/MessageMenu/MessageMenu.ts";
import { useDismissable } from "@/hooks/useDismissable.ts";
import { listEtiquetas, type Etiqueta } from "@/services/etiquetas.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";
import type { ChatWindowProps } from "./ChatWindow.ts";
import "./ChatWindow.css";
import "../ChatInput/ChatInput.css";
import "../MessageBubble/MessageBubble.css";
import "../ChatMoreMenu/ChatMoreMenu.css";
import "../ConfirmModal/ConfirmModal.css";
import "../MessageMenu/MessageMenu.css";
import "../DocumentPreview/DocumentPreview.css";
import "../ContactPanel/ContactPanel.css";
import "../EtiquetaSelect/EtiquetaSelect.css";

function seedTagIds(etiquetas: Etiqueta[], label?: string): string[] {
  if (!label) return [];
  const match = etiquetas.find(
    (e) => e.name.toLowerCase() === label.trim().toLowerCase(),
  );
  return match ? [match.id] : [];
}

type MsgMenuState = {
  messageId: string;
  x: number;
  y: number;
  canDelete: boolean;
} | null;

function buildReplyDraft(msg: ChatMessage, senderName: string): ReplyDraft {
  return {
    messageId: msg.id,
    author: msg.from === "out" ? "Você" : senderName,
    text: msg.text,
    image: Boolean(msg.image),
    video: Boolean(msg.video),
    audio: Boolean(msg.audio),
    attachment: msg.attachment ? { name: msg.attachment.name } : undefined,
  };
}

export function ChatWindow({
  activeChat,
  messages = [],
  onBack,
  onSend,
  onAction,
  onDeleteMessage,
  onReactMessage,
}: ChatWindowProps) {
  const navigate = useNavigate();
  const messagesRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const tagPickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);

  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMounted, setContactMounted] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<DocumentPreviewFile | null>(null);
  const [hasComposerPreview, setHasComposerPreview] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null);
  const [msgMenu, setMsgMenu] = useState<MsgMenuState>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<string | null>(null);

  const selectedTags = etiquetas.filter((e) => tagIds.includes(e.id));
  const contactMedia = collectChatMedia(messages);
  const tagQ = tagSearch.trim().toLowerCase();
  const filteredTags = tagQ
    ? etiquetas.filter((e) => e.name.toLowerCase().includes(tagQ))
    : etiquetas;

  const senderName = activeChat.company
    ? `${activeChat.name} - ${activeChat.company}`
    : activeChat.name;

  const searchQ = msgSearchQuery.trim().toLowerCase();
  const matchCount = searchQ
    ? messages.filter((m) => (m.text || "").toLowerCase().includes(searchQ)).length
    : 0;

  useDismissable({
    open: moreOpen,
    onDismiss: () => setMoreOpen(false),
    refs: [moreRef],
  });

  useDismissable({
    open: tagMenuOpen,
    onDismiss: () => {
      setDraftTagIds(tagIds);
      setTagSearch("");
      setTagMenuOpen(false);
    },
    refs: [tagPickerRef],
  });

  const scrollToEnd = useEffectEvent(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  const scrollStateRef = useRef<{ chatId: string; length: number; lastId: string } | null>(null);

  useEffect(() => {
    const lastId = messages.at(-1)?.id ?? "";
    const prev = scrollStateRef.current;
    const next = { chatId: activeChat.id, length: messages.length, lastId };
    scrollStateRef.current = next;

    const chatChanged = !prev || prev.chatId !== next.chatId;
    const appended =
      Boolean(prev) &&
      prev!.chatId === next.chatId &&
      next.length > prev!.length;
    const replacedTail =
      Boolean(prev) &&
      prev!.chatId === next.chatId &&
      next.length === prev!.length &&
      next.lastId !== prev!.lastId;

    // Só desce em troca de chat, mensagem nova ou resposta — não em reação/edição in-place
    if (chatChanged || appended || replacedTail) {
      scrollToEnd();
    }
  }, [messages, activeChat.id]);

  useEffect(() => {
    if (hasComposerPreview) scrollToEnd();
  }, [hasComposerPreview]);

  useEffect(() => {
    let cancelled = false;
    listEtiquetas()
      .then((items) => {
        if (!cancelled) setEtiquetas(items);
      })
      .catch(() => {
        if (!cancelled) setEtiquetas([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setReplyTo(null);
    setMsgMenu(null);
    setMoreOpen(false);
    setContactOpen(false);
    setContactMounted(false);
    setTagMenuOpen(false);
    setTagSearch("");
    setMsgSearchOpen(false);
    setMsgSearchQuery("");
    setConfirmDelete(false);
    setConfirmDeleteMessageId(null);
    setDocumentFile(null);
    setLightboxSrc(null);
  }, [activeChat.id]);

  useEffect(() => {
    const seeded = seedTagIds(etiquetas, activeChat.tag?.label);
    setTagIds(seeded);
    setDraftTagIds(seeded);
  }, [activeChat.id, activeChat.tag?.label, etiquetas]);

  useEffect(() => {
    if (!msgSearchOpen) return;
    searchInputRef.current?.focus({ preventScroll: true });
  }, [msgSearchOpen]);

  useEffect(() => {
    if (!tagMenuOpen) return;
    tagSearchRef.current?.focus({ preventScroll: true });
  }, [tagMenuOpen]);

  function openTagMenu() {
    setMoreOpen(false);
    setMsgMenu(null);
    setDraftTagIds(tagIds);
    setTagSearch("");
    setTagMenuOpen(true);
  }

  function toggleDraftTag(id: string) {
    setDraftTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function applyTags() {
    setTagIds(draftTagIds);
    setTagSearch("");
    setTagMenuOpen(false);
  }

  function toggleContactPanel() {
    setMoreOpen(false);
    setMsgMenu(null);
    setTagMenuOpen(false);
    setContactOpen((v) => {
      const next = !v;
      if (next) setContactMounted(true);
      return next;
    });
  }

  function closeContactPanel() {
    setContactOpen(false);
  }

  useEffect(() => {
    if (!searchQ || !matchCount) return;
    const firstHit = messagesRef.current?.querySelector(".message.is-search-hit");
    firstHit?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [searchQ, matchCount, messages]);

  function openMessageMenu(message: ChatMessage, e: MouseEvent) {
    e.preventDefault();
    setMoreOpen(false);
    setMsgMenu({
      messageId: message.id,
      x: e.clientX,
      y: e.clientY,
      canDelete: message.from === "out",
    });
  }

  function handleMenuAction(action: MessageMenuAction, emoji?: string) {
    const messageId = msgMenu?.messageId;
    const msg = messages.find((m) => m.id === messageId);
    setMsgMenu(null);
    if (!msg || !messageId) return;

    if (action === "reply") {
      setReplyTo(buildReplyDraft(msg, senderName));
      return;
    }
    if (action === "delete") {
      setConfirmDeleteMessageId(messageId);
      return;
    }
    if (action === "react" && emoji) {
      onReactMessage?.(messageId, emoji);
    }
  }

  function scrollToQuotedMessage(messageId: string) {
    const root = messagesRef.current;
    if (!root || !messageId) return;
    const el = root.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(messageId)}"]`,
    );
    if (!el) return;

    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.remove("is-quote-target");
    // reflow para reiniciar animação se clicar de novo
    void el.offsetWidth;
    el.classList.add("is-quote-target");
    window.setTimeout(() => el.classList.remove("is-quote-target"), 1400);
  }

  function handleChatAction(action: string) {
    setMoreOpen(false);
    if (action === "deletar") {
      setConfirmDelete(true);
      return;
    }
    onAction?.(action);
  }

  return (
    <main
      className={`chat-window${isDropTarget ? " is-drop-target" : ""}${
        contactMounted ? " has-contact-panel" : ""
      }${contactOpen ? " is-contact-open" : ""}`}
      id="chat-window"
      aria-label={`Conversa com ${activeChat.name}`}
    >
      <div className="chat-window__column">
      <header className="chat-window__header">
        <div className="chat-window__identity">
          <button type="button" className="chat-window__back icon-btn" aria-label="Voltar" onClick={onBack}>
            <Icons.ChevronLeft />
          </button>
          <button
            type="button"
            className="chat-window__avatar-btn"
            aria-label={`Ver contato ${activeChat.name}`}
            aria-expanded={contactOpen}
            onClick={toggleContactPanel}
          >
            <img className="chat-window__avatar" src={activeChat.avatar} alt="" />
          </button>
          <div className="chat-window__meta">
            <div className="chat-window__name-row">
              <button
                type="button"
                className="chat-window__name"
                id="chat-contact-name"
                aria-expanded={contactOpen}
                onClick={toggleContactPanel}
              >
                {activeChat.name}
              </button>
              {selectedTags.length > 0 ? (
                <div className="chat-window__tags" aria-label="Etiquetas">
                  {selectedTags.map((et) => (
                    <span
                      key={et.id}
                      className="chat-window__tag"
                      style={{ background: et.color }}
                      title={et.name}
                      aria-label={et.name}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="chat-window__assignee" id="chat-contact-assignee">
              <span className="chat-window__assignee-text">
                <small>Responsável</small>: {activeChat.assignee || ""}
              </span>
              <div
                className={`chat-window__etiqueta-picker${tagMenuOpen ? " is-open" : ""}`}
                ref={tagPickerRef}
              >
                <button
                  type="button"
                  className="chat-window__etiqueta-add"
                  aria-label="Adicionar etiqueta"
                  title="Adicionar etiqueta"
                  aria-haspopup="listbox"
                  aria-expanded={tagMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tagMenuOpen) {
                      setDraftTagIds(tagIds);
                      setTagSearch("");
                      setTagMenuOpen(false);
                      return;
                    }
                    openTagMenu();
                  }}
                >
                  <Icons.Plus size="xs" />
                </button>
                {tagMenuOpen ? (
                  <div
                    className="etiqueta-select__menu chat-window__etiqueta-menu"
                    role="listbox"
                    aria-multiselectable="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={tagSearchRef}
                      type="search"
                      className="etiqueta-select__search"
                      placeholder="Pesquisar etiqueta"
                      aria-label="Pesquisar etiqueta"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                    />
                    <button
                      type="button"
                      className="etiqueta-select__clear"
                      hidden={draftTagIds.length === 0}
                      onClick={() => setDraftTagIds([])}
                    >
                      Limpar seleção
                    </button>
                    <div className="etiqueta-select__list">
                      {filteredTags.length === 0 ? (
                        <p className="contact-etiqueta-picker__empty">Nenhuma etiqueta encontrada.</p>
                      ) : (
                        filteredTags.map((et: Etiqueta) => {
                          const on = draftTagIds.includes(et.id);
                          return (
                            <button
                              key={et.id}
                              type="button"
                              className={`etiqueta-select__option${on ? " is-active" : ""}`}
                              role="option"
                              aria-selected={on}
                              onClick={() => toggleDraftTag(et.id)}
                            >
                              <span className="etiqueta-select__check" aria-hidden="true" />
                              <span
                                className="etiqueta-chip"
                                style={{ ["--etiqueta-color" as string]: et.color }}
                              >
                                <span className="etiqueta-chip__bar" aria-hidden="true" />
                                <span className="etiqueta-chip__name">{et.name}</span>
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="chat-window__etiqueta-footer">
                      <button
                        type="button"
                        className="chat-window__etiqueta-apply"
                        onClick={applyTags}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="chat-window__actions">
          <button
            type="button"
            className={`icon-btn${msgSearchOpen ? " is-active" : ""}`}
            id="chat-search-toggle"
            aria-label="Buscar na conversa"
            aria-pressed={msgSearchOpen}
            onClick={() => {
              setMsgSearchOpen((v) => !v);
              setMoreOpen(false);
              setMsgMenu(null);
            }}
          >
            <Icons.Search />
          </button>

          <div className={`chat-more${moreOpen ? " is-open" : ""}`} id="chat-more" ref={moreRef}>
            <button
              type="button"
              className="icon-btn"
              id="chat-more-btn"
              aria-label="Mais opções"
              aria-haspopup="true"
              aria-expanded={moreOpen}
              aria-controls="chat-more-menu"
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen((v) => !v);
                setMsgMenu(null);
              }}
            >
              <Icons.More />
            </button>
            <ChatMoreMenu open={moreOpen} onAction={handleChatAction} />
          </div>
        </div>
      </header>

      {msgSearchOpen ? (
        <div className="chat-msg-search is-open" id="chat-msg-search">
          <Icons.Search />
          <input
            ref={searchInputRef}
            type="search"
            id="chat-msg-search-input"
            className="chat-msg-search__input"
            placeholder="Buscar na conversa"
            aria-label="Buscar na conversa"
            value={msgSearchQuery}
            onChange={(e) => setMsgSearchQuery(e.target.value)}
          />
          <span className="chat-msg-search__count" id="chat-msg-search-count">
            {searchQ ? `${matchCount}` : ""}
          </span>
          <button
            type="button"
            className="chat-msg-search__close"
            id="chat-msg-search-close"
            aria-label="Fechar busca"
            onClick={() => {
              setMsgSearchOpen(false);
              setMsgSearchQuery("");
            }}
          >
            <Icons.X />
          </button>
        </div>
      ) : null}

      <div
        className={`chat-window__messages${hasComposerPreview ? " has-composer-preview" : ""}${
          replyTo ? " has-composer-reply" : ""
        }`}
        id="chat-messages"
        role="log"
        aria-live="polite"
        ref={messagesRef}
      >
        <div className="date-separator">Hoje</div>
        {messages.map((msg) => {
          if (msg.from === "system") {
            return (
              <div key={msg.id} className="chat-notice" role="status">
                {msg.text}
              </div>
            );
          }
          const hit = Boolean(searchQ) && (msg.text || "").toLowerCase().includes(searchQ);
          const searchClass = searchQ ? (hit ? "is-search-hit" : "is-search-dim") : "";
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              senderName={senderName}
              senderAvatar={msg.from === "in" ? activeChat.avatar : undefined}
              className={searchClass}
              onImageClick={setLightboxSrc}
              onDocumentClick={setDocumentFile}
              onContextMenu={(e) => openMessageMenu(msg, e)}
              onReply={() => setReplyTo(buildReplyDraft(msg, senderName))}
              onDelete={
                msg.from === "out" ? () => setConfirmDeleteMessageId(msg.id) : undefined
              }
              onQuoteClick={scrollToQuotedMessage}
            />
          );
        })}
      </div>

      {activeChat.status === "waiting" ? (
        <div className="chat-window__assume">
          <button
            type="button"
            className="chat-window__assume-btn"
            onClick={() => onAction?.("assumir")}
          >
            Assumir
          </button>
        </div>
      ) : (
        <ChatInput
          conversationId={activeChat.id}
          replyTo={replyTo}
          onClearReply={() => setReplyTo(null)}
          onSend={onSend}
          onPreviewChange={setHasComposerPreview}
          onDropTargetChange={setIsDropTarget}
        />
      )}

      <Lightbox
        open={Boolean(lightboxSrc)}
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <DocumentPreview
        open={Boolean(documentFile)}
        file={documentFile}
        onClose={() => setDocumentFile(null)}
      />

      <MessageMenu
        open={Boolean(msgMenu)}
        x={msgMenu?.x ?? 0}
        y={msgMenu?.y ?? 0}
        canDelete={msgMenu?.canDelete}
        onClose={() => setMsgMenu(null)}
        onAction={handleMenuAction}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Deletar conversa?"
        description={`A conversa com ${activeChat.name} será removida da lista. Essa ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onAction?.("deletar");
        }}
      />

      <ConfirmModal
        open={Boolean(confirmDeleteMessageId)}
        title="Deletar mensagem?"
        description="Essa mensagem será removida da conversa. Essa ação não pode ser desfeita."
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        danger
        onCancel={() => setConfirmDeleteMessageId(null)}
        onConfirm={() => {
          const id = confirmDeleteMessageId;
          setConfirmDeleteMessageId(null);
          if (id) onDeleteMessage?.(id);
        }}
      />
      </div>

      {contactMounted ? (
        <ContactPanel
          chat={activeChat}
          media={contactMedia}
          open={contactOpen}
          onClose={closeContactPanel}
          onExited={() => setContactMounted(false)}
          onEdit={() => navigate("/contatos")}
          onOpenImage={setLightboxSrc}
          onOpenDocument={setDocumentFile}
        />
      ) : null}
    </main>
  );
}
