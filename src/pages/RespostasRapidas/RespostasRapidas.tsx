import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { FormActions } from "@/componentes/FormActions/FormActions.tsx";
import { PageModal } from "@/componentes/PageModal/PageModal.tsx";
import { Pagination } from "@/componentes/Pagination/Pagination.tsx";
import { RowActions } from "@/componentes/RowActions/RowActions.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import {
  createRespostaRapida,
  deleteRespostaRapida,
  fetchRespostasRapidas,
  updateRespostaRapida,
  type RespostaRapida,
} from "@/services/respostasRapidas.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "./RespostasRapidas.css";

const PAGE_SIZE = 20;

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; item: RespostaRapida };

export function RespostasRapidas() {
  const shortcutRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<RespostaRapida[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [formShortcut, setFormShortcut] = useState("");
  const [formText, setFormText] = useState("");
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<RespostaRapida | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchRespostasRapidas({ page, pageSize: PAGE_SIZE, query })
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setItems([]);
          setTotal(0);
          setLoading(false);
        });
    }, query ? 220 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, query]);

  useEffect(() => {
    if (!modal.open) return;
    const t = window.setTimeout(() => shortcutRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [modal]);

  function openCreate() {
    setFormShortcut("");
    setFormText("");
    setFormError("");
    setModal({ open: true, mode: "create" });
  }

  function openEdit(item: RespostaRapida) {
    setFormShortcut(item.shortcut);
    setFormText(item.text);
    setFormError("");
    setModal({ open: true, mode: "edit", item });
  }

  function closeModal() {
    if (saving) return;
    setModal({ open: false });
    setFormError("");
  }

  function matchesQuery(item: RespostaRapida) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.shortcut.toLowerCase().includes(q) || item.text.toLowerCase().includes(q);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const shortcut = formShortcut.trim();
    const text = formText.trim();
    if (!shortcut) {
      setFormError("Informe o atalho.");
      return;
    }
    if (!text) {
      setFormError("Informe a resposta rápida.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modal.open && modal.mode === "edit") {
        const updated = await updateRespostaRapida({
          id: modal.item.id,
          shortcut,
          text,
        });
        setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await createRespostaRapida({ shortcut, text });
        if (matchesQuery(created) && page === 1) {
          setItems((prev) => [created, ...prev].slice(0, PAGE_SIZE));
        }
        setTotal((t) => t + 1);
      }
      setModal({ open: false });
    } catch {
      setFormError("Não foi possível salvar. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    try {
      await deleteRespostaRapida({ id });
      setItems((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* mock — ignore */
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading ? "…" : `${total} resposta${total === 1 ? "" : "s"}`;

  return (
    <InternasTemplate
      active="respostas-rapidas"
      title="Resposta rápida"
      countLabel={countLabel}
      pageId="resposta-rapida-page"
      ariaLabel="Resposta rápida"
      searchPlaceholder="Buscar resposta"
      searchAriaLabel="Buscar resposta rápida"
      searchValue={query}
      onSearchChange={(value) => {
        setPage(1);
        setQuery(value);
      }}
      addId="resposta-rapida-add-btn"
      addLabel="Adicionar resposta rápida"
      onAdd={openCreate}
      stickyTable
    >
      <div
        className="page-panel__list quick-reply-table sticky-table"
        id="resposta-rapida-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando respostas rápidas" : undefined}
      >
        {loading ? (
          <>
            <div className="quick-reply-table__head" aria-hidden="true">
              <span className="quick-reply-table__col quick-reply-table__col--shortcut">Atalho</span>
              <span className="quick-reply-table__col quick-reply-table__col--text">Resposta rápida</span>
              <span className="quick-reply-table__col quick-reply-table__col--actions">Ações</span>
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="quick-reply-row quick-reply-row--skeleton" aria-hidden="true">
                <span className="skeleton skeleton--line" style={{ width: "40%", height: 12 }} />
                <span className="skeleton skeleton--line" style={{ width: "85%", height: 10 }} />
                <div className="quick-reply-row__actions">
                  <span className="skeleton contact-row__skeleton-action" />
                  <span className="skeleton contact-row__skeleton-action" />
                </div>
              </div>
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="page-panel__empty">Nenhuma resposta rápida encontrada.</p>
        ) : (
          <>
            <div className="quick-reply-table__head" aria-hidden="true">
              <span className="quick-reply-table__col quick-reply-table__col--shortcut">Atalho</span>
              <span className="quick-reply-table__col quick-reply-table__col--text">Resposta rápida</span>
              <span className="quick-reply-table__col quick-reply-table__col--actions">Ações</span>
            </div>
            {items.map((r) => (
              <article key={r.id} className="quick-reply-row" data-resposta-id={r.id} role="listitem">
                <div className="quick-reply-row__shortcut">{r.shortcut}</div>
                <div className="quick-reply-row__text" title={r.text || ""}>
                  {r.text || "—"}
                </div>
                <RowActions
                  className="quick-reply-row__actions"
                  onEdit={() => openEdit(r)}
                  onDelete={() => setPendingDelete(r)}
                />
              </article>
            ))}
          </>
        )}
      </div>

      {!loading ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}

      {modal.open ? (
        <PageModal
          open
          id="resposta-rapida-modal"
          title={modal.mode === "edit" ? "Editar resposta rápida" : "Nova resposta rápida"}
          onClose={closeModal}
        >
            <form className="contact-form" autoComplete="off" onSubmit={handleSubmit}>
              <label className="contact-field">
                <span className="contact-field__label">Atalho</span>
                <input
                  ref={shortcutRef}
                  type="text"
                  id="resposta-rapida-shortcut"
                  name="shortcut"
                  placeholder="ola"
                  value={formShortcut}
                  required
                  onChange={(e) => setFormShortcut(e.target.value)}
                />
              </label>

              <label className="contact-field">
                <span className="contact-field__label">Resposta rápida</span>
                <textarea
                  id="resposta-rapida-text"
                  name="text"
                  rows={4}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                />
              </label>

              {formError ? <p className="resposta-form__error">{formError}</p> : null}

              <FormActions
                onCancel={closeModal}
                disabled={saving}
                submitLabel={saving ? "Salvando…" : modal.mode === "edit" ? "Salvar" : "Adicionar"}
              />
            </form>
        </PageModal>
      ) : null}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remover resposta rápida?"
        description={
          pendingDelete
            ? `A resposta "${pendingDelete.shortcut}" será removida. Essa ação não pode ser desfeita.`
            : ""
        }
        cancelLabel="Cancelar"
        confirmLabel="Remover"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </InternasTemplate>
  );
}
