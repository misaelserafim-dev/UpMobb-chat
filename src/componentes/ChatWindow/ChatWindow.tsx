import { useEffect, useEffectEvent, useRef, useState, type MouseEvent } from "react";
import { ChatInput } from "@/componentes/ChatInput/ChatInput.tsx";
import type { ReplyDraft } from "@/componentes/ChatInput/ChatInput.ts";
import { ChatMoreMenu } from "@/componentes/ChatMoreMenu/ChatMoreMenu.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { Lightbox } from "@/componentes/Lightbox/Lightbox.tsx";
import { MessageBubble } from "@/componentes/MessageBubble/MessageBubble.tsx";
import { MessageMenu } from "@/componentes/MessageMenu/MessageMenu.tsx";
import type { MessageMenuAction } from "@/componentes/MessageMenu/MessageMenu.ts";
import { useDismissable } from "@/hooks/useDismissable.ts";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { ChatWindowProps } from "./ChatWindow.ts";
import "./ChatWindow.css";
import "../ChatInput/ChatInput.css";
import "../MessageBubble/MessageBubble.css";
import "../ChatMoreMenu/ChatMoreMenu.css";
import "../ConfirmModal/ConfirmModal.css";
import "../MessageMenu/MessageMenu.css";

type MsgMenuState = {
  messageId: string;
  x: number;
  y: number;
  canDelete: boolean;
} | null;

function buildReplyDraft(msg: ChatMessage, senderName: string): ReplyDraft {
  return {
    author: msg.from === "out" ? "Você" : senderName,
    text: msg.text,
    image: Boolean(msg.image),
    video: Boolean(msg.video),
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
  const messagesRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [hasComposerPreview, setHasComposerPreview] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null);
  const [msgMenu, setMsgMenu] = useState<MsgMenuState>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const scrollToEnd = useEffectEvent(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    scrollToEnd();
  }, [messages, activeChat.id]);

  useEffect(() => {
    if (hasComposerPreview) scrollToEnd();
  }, [hasComposerPreview]);

  useEffect(() => {
    setReplyTo(null);
    setMsgMenu(null);
    setMoreOpen(false);
    setMsgSearchOpen(false);
    setMsgSearchQuery("");
    setConfirmDelete(false);
  }, [activeChat.id]);

  useEffect(() => {
    if (!msgSearchOpen) return;
    searchInputRef.current?.focus({ preventScroll: true });
  }, [msgSearchOpen]);

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
      onDeleteMessage?.(messageId);
      return;
    }
    if (action === "react" && emoji) {
      onReactMessage?.(messageId, emoji);
    }
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
      className={`chat-window${isDropTarget ? " is-drop-target" : ""}`}
      id="chat-window"
      aria-label={`Conversa com ${activeChat.name}`}
    >
      <header className="chat-window__header">
        <div className="chat-window__identity">
          <button type="button" className="chat-window__back icon-btn" aria-label="Voltar" onClick={onBack}>
            <Icons.ChevronLeft />
          </button>
          <img className="chat-window__avatar" src={activeChat.avatar} alt="" />
          <div className="chat-window__meta">
            <div className="chat-window__name" id="chat-contact-name">
              {activeChat.name}
            </div>
            <div className="chat-window__assignee" id="chat-contact-assignee">
              <small>Responsável</small>: {activeChat.assignee || ""}
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
          const hit = Boolean(searchQ) && (msg.text || "").toLowerCase().includes(searchQ);
          const searchClass = searchQ ? (hit ? "is-search-hit" : "is-search-dim") : "";
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              senderName={senderName}
              className={searchClass}
              onImageClick={setLightboxSrc}
              onContextMenu={(e) => openMessageMenu(msg, e)}
            />
          );
        })}
      </div>

      <ChatInput
        conversationId={activeChat.id}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        onSend={onSend}
        onPreviewChange={setHasComposerPreview}
        onDropTargetChange={setIsDropTarget}
      />

      <Lightbox
        open={Boolean(lightboxSrc)}
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
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
    </main>
  );
}
