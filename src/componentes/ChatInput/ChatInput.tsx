import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import {
  filterRespostasRapidas,
  type RespostaRapida,
} from "@/services/respostasRapidas.ts";
import type { ChatInputProps, PendingAttachment, ReplyDraft } from "./ChatInput.ts";
import "./ChatInput.css";

function formatFileSize(bytes: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filesToAttachments(files: File[]): PendingAttachment[] {
  return files.filter(Boolean).map((file, i) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const ext = (file.name.split(".").pop() || "FILE").toUpperCase();
    return {
      id: `att-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      kind: isImage ? "image" : isVideo ? "video" : "file",
      src: URL.createObjectURL(file),
      name: file.name || (isImage ? "imagem.png" : "arquivo"),
      type: file.type,
      ext,
      sizeLabel: formatFileSize(file.size),
    };
  });
}

function fileBadge(attachment: PendingAttachment) {
  return (attachment.ext || "FILE").slice(0, 4);
}

function hasDragFiles(e: DragEvent) {
  return Array.from(e.dataTransfer?.types || []).includes("Files");
}

function replyPreviewText(reply: ReplyDraft) {
  if (reply.text?.trim()) return reply.text;
  if (reply.image) return "Foto";
  if (reply.video) return "Vídeo";
  if (reply.attachment) return reply.attachment.name || "Arquivo";
  return "Mensagem";
}

function getSlashState(input: HTMLElement | null) {
  if (!input) return null;
  const sel = window.getSelection();
  if (!sel?.rangeCount || !input.contains(sel.focusNode)) return null;
  const caret = sel.getRangeAt(0);
  if (!caret.collapsed) return null;

  const pre = document.createRange();
  pre.selectNodeContents(input);
  pre.setEnd(caret.endContainer, caret.endOffset);
  const before = pre.toString().replace(/\u00a0/g, " ");

  const match = before.match(/(^|[\s\n])\/([^\s\n]*)$/);
  if (!match) return null;

  return {
    query: match[2].toLowerCase(),
    before,
  };
}

function placeCaret(el: HTMLElement, offset: number) {
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;

  let remaining = offset;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walk.nextNode();
  while (node) {
    const len = node.textContent?.length || 0;
    if (remaining <= len) {
      range.setStart(node, remaining);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    remaining -= len;
    node = walk.nextNode();
  }
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function ChatInput({
  conversationId,
  replyTo = null,
  onClearReply,
  onSend,
  onPreviewChange,
  onDropTargetChange,
}: ChatInputProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<PendingAttachment[]>([]);
  const addFilesRef = useRef<(files: File[]) => void>(() => {});
  const slashQueryRef = useRef<string | null>(null);
  const [empty, setEmpty] = useState(true);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashMatches, setSlashMatches] = useState<RespostaRapida[]>([]);
  const [slashIndex, setSlashIndex] = useState(0);

  function revokeAll(list: PendingAttachment[]) {
    list.forEach((a) => {
      if (a.src.startsWith("blob:")) URL.revokeObjectURL(a.src);
    });
  }

  function setAttachmentsSafe(updater: (prev: PendingAttachment[]) => PendingAttachment[]) {
    setAttachments((prev) => {
      const next = updater(prev);
      attachmentsRef.current = next;
      return next;
    });
  }

  function clearAttachments() {
    setAttachmentsSafe((prev) => {
      revokeAll(prev);
      return [];
    });
  }

  function closeSlash() {
    setSlashOpen(false);
    setSlashMatches([]);
    setSlashIndex(0);
    slashQueryRef.current = null;
  }

  function updateSlashMenu() {
    const state = getSlashState(fieldRef.current);
    if (!state) {
      closeSlash();
      return;
    }

    const query = state.query;
    const queryChanged = slashQueryRef.current !== query;
    slashQueryRef.current = query;

    void filterRespostasRapidas({ query, limit: 8 })
      .then((matches) => {
        if (slashQueryRef.current !== query) return;
        setSlashMatches(matches);
        setSlashOpen(true);
        setSlashIndex((prev) => {
          if (queryChanged) return 0;
          if (!matches.length) return 0;
          return Math.min(prev, matches.length - 1);
        });
      })
      .catch(() => {
        if (slashQueryRef.current !== query) return;
        closeSlash();
      });
  }

  function applySlash(reply: RespostaRapida) {
    const input = fieldRef.current;
    const state = getSlashState(input);
    if (!input || !state || !reply) return;

    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const caret = sel.getRangeAt(0);

    const post = document.createRange();
    post.selectNodeContents(input);
    post.setStart(caret.endContainer, caret.endOffset);
    const after = post.toString().replace(/\u00a0/g, " ");

    const newBefore = state.before.replace(/\/[^\s\n]*$/, reply.text);
    input.textContent = newBefore + after;
    placeCaret(input, newBefore.length);
    setEmpty(!input.textContent.trim());
    closeSlash();
    input.focus({ preventScroll: true });
  }

  const setDropTarget = useEffectEvent((active: boolean) => {
    onDropTargetChange?.(active);
  });

  useEffect(() => {
    fieldRef.current?.focus();
  }, [conversationId]);

  useEffect(() => {
    clearAttachments();
    onClearReply?.();
    if (fieldRef.current) fieldRef.current.innerHTML = "";
    setEmpty(true);
    closeSlash();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when conversation changes
  }, [conversationId]);

  useEffect(() => {
    onPreviewChange?.(attachments.length > 0 || Boolean(replyTo));
  }, [attachments.length, replyTo, onPreviewChange]);

  useEffect(() => {
    return () => {
      revokeAll(attachmentsRef.current);
      setDropTarget(false);
    };
  }, []);

  useEffect(() => {
    const dropTarget =
      wrapRef.current?.closest<HTMLElement>(".chat-window") || wrapRef.current;
    if (!dropTarget) return;

    let dragDepth = 0;

    function onEnter(e: DragEvent) {
      if (!hasDragFiles(e)) return;
      e.preventDefault();
      dragDepth += 1;
      setDropTarget(true);
    }

    function onOver(e: DragEvent) {
      if (!hasDragFiles(e)) return;
      e.preventDefault();
    }

    function onLeave(e: DragEvent) {
      if (!hasDragFiles(e)) return;
      e.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) setDropTarget(false);
    }

    function onDrop(e: DragEvent) {
      if (!hasDragFiles(e)) return;
      e.preventDefault();
      dragDepth = 0;
      setDropTarget(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) addFilesRef.current(files);
    }

    dropTarget.addEventListener("dragenter", onEnter);
    dropTarget.addEventListener("dragover", onOver);
    dropTarget.addEventListener("dragleave", onLeave);
    dropTarget.addEventListener("drop", onDrop);

    return () => {
      setDropTarget(false);
      dropTarget.removeEventListener("dragenter", onEnter);
      dropTarget.removeEventListener("dragover", onOver);
      dropTarget.removeEventListener("dragleave", onLeave);
      dropTarget.removeEventListener("drop", onDrop);
    };
  }, []);

  function syncEmpty() {
    const text = fieldRef.current?.innerText.replace(/\u00a0/g, " ").trim() || "";
    setEmpty(!text);
  }

  function addFiles(files: File[]) {
    const next = filesToAttachments(files);
    if (!next.length) return;
    setAttachmentsSafe((prev) => [...prev, ...next]);
  }
  addFilesRef.current = addFiles;

  function removeAttachment(id: string) {
    setAttachmentsSafe((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.src.startsWith("blob:")) URL.revokeObjectURL(item.src);
      return prev.filter((a) => a.id !== id);
    });
  }

  function getComposerContent() {
    const el = fieldRef.current;
    if (!el) return { text: "", html: "" };
    const text = el.innerText.replace(/\u00a0/g, " ").trim();
    const html = el.innerHTML.trim();
    return { text, html };
  }

  function submit() {
    if (slashOpen) return;
    const { text, html } = getComposerContent();
    const files = [...attachments];
    if (!text && !files.length) return;

    onSend?.({
      text,
      html: html.includes("<") ? html : undefined,
      attachments: files,
      replyTo: replyTo || null,
    });

    if (fieldRef.current) fieldRef.current.innerHTML = "";
    setEmpty(true);
    attachmentsRef.current = [];
    setAttachments([]);
    closeSlash();
    onClearReply?.();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (slashOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSlash();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!slashMatches.length) return;
        setSlashIndex((i) => (i + 1) % slashMatches.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!slashMatches.length) return;
        setSlashIndex((i) => (i - 1 + slashMatches.length) % slashMatches.length);
        return;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        if (!slashMatches.length) {
          closeSlash();
          if (e.key === "Tab") e.preventDefault();
          return;
        }
        e.preventDefault();
        applySlash(slashMatches[slashIndex]);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleInput() {
    syncEmpty();
    updateSlashMenu();
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }

    if (imageFiles.length) {
      e.preventDefault();
      addFiles(imageFiles);
      fieldRef.current?.focus();
      return;
    }

    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plain);
    syncEmpty();
    updateSlashMenu();
  }

  const hasPreview = attachments.length > 0;
  const hasReply = Boolean(replyTo);

  return (
    <div
      className={`chat-composer-wrap${hasPreview ? " has-preview" : ""}${hasReply ? " has-reply" : ""}`}
      id="chat-composer-wrap"
      ref={wrapRef}
    >
      {replyTo ? (
        <div className="composer-reply" id="composer-reply">
          <div className="composer-reply__bar" />
          <div className="composer-reply__body">
            <strong>{replyTo.author || "Mensagem"}</strong>
            <span>{replyPreviewText(replyTo)}</span>
          </div>
          <button
            type="button"
            className="composer-reply__remove"
            id="composer-reply-remove"
            aria-label="Cancelar resposta"
            onClick={() => onClearReply?.()}
          >
            <Icons.X />
          </button>
        </div>
      ) : null}

      {hasPreview ? (
        <div className="composer-preview" id="composer-preview">
          <div className="composer-preview__list">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={`composer-preview__item${
                  attachment.kind === "file" ? " composer-preview__item--file" : ""
                }`}
                data-preview-id={attachment.id}
              >
                {attachment.kind === "image" ? (
                  <div className="composer-preview__media">
                    <img src={attachment.src} alt="" />
                  </div>
                ) : null}
                {attachment.kind === "video" ? (
                  <div className="composer-preview__media composer-preview__media--video">
                    <video src={attachment.src} muted />
                  </div>
                ) : null}
                {attachment.kind === "file" ? (
                  <>
                    <div className="composer-preview__file">{fileBadge(attachment)}</div>
                    <div className="composer-preview__meta">
                      <strong>{attachment.name || "Arquivo"}</strong>
                      <span>{attachment.sizeLabel || ""}</span>
                    </div>
                  </>
                ) : null}
                <button
                  type="button"
                  className="composer-preview__remove"
                  aria-label="Remover anexo"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <Icons.X />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {slashOpen ? (
        <div
          className="composer-slash"
          id="composer-slash"
          role="listbox"
          aria-label="Respostas rápidas"
        >
          {slashMatches.length === 0 ? (
            <div className="composer-slash__empty">Nenhuma resposta rápida</div>
          ) : (
            slashMatches.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className={`composer-slash__item${i === slashIndex ? " is-active" : ""}`}
                role="option"
                aria-selected={i === slashIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySlash(r);
                }}
              >
                <span className="composer-slash__shortcut">/{r.shortcut}</span>
                <span className="composer-slash__text">{r.text}</span>
              </button>
            ))
          )}
        </div>
      ) : null}

      <form className="chat-composer" id="chat-composer" autoComplete="off" onSubmit={handleSubmit}>
        <button
          type="button"
          className="composer-btn"
          aria-label="Anexar"
          id="composer-attach"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icons.Plus />
        </button>

        <div
          className={`composer-field${empty ? " is-empty" : ""}`}
          id="composer-field"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Mensagem"
          data-placeholder="Digite uma mensagem"
          ref={fieldRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <button type="submit" className="composer-send" aria-label="Enviar">
          <Icons.Send />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          id="composer-file-input"
          className="composer-file-input"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) addFiles(files);
            e.target.value = "";
          }}
        />
      </form>
    </div>
  );
}
