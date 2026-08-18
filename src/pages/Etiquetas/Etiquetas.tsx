import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ColorPresetPicker } from "@/componentes/ColorPresetPicker/ColorPresetPicker.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import {
  createEtiqueta,
  deleteEtiqueta,
  fetchEtiquetas,
  updateEtiqueta,
  type Etiqueta,
} from "@/services/etiquetas.ts";
import {
  DEFAULT_ETIQUETA_COLOR,
  ETIQUETA_COLORS,
  resolvePresetColor,
} from "@/utils/presetColors.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "@/componentes/ColorPresetPicker/ColorPresetPicker.css";
import "./Etiquetas.css";

const PAGE_SIZE = 40;

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; item: Etiqueta };

export function Etiquetas() {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Etiqueta[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(DEFAULT_ETIQUETA_COLOR);
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Etiqueta | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchEtiquetas({ page, pageSize: PAGE_SIZE, query })
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
    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [modal]);

  function openCreate() {
    setFormName("");
    setFormColor(DEFAULT_ETIQUETA_COLOR);
    setFormError("");
    setModal({ open: true, mode: "create" });
  }

  function openEdit(item: Etiqueta) {
    setFormName(item.name);
    setFormColor(resolvePresetColor(item.color, ETIQUETA_COLORS));
    setFormError("");
    setModal({ open: true, mode: "edit", item });
  }

  function closeModal() {
    if (saving) return;
    setModal({ open: false });
    setFormError("");
  }

  function matchesQuery(item: Etiqueta) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.color.toLowerCase().includes(q);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Informe o nome da etiqueta.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modal.open && modal.mode === "edit") {
        const updated = await updateEtiqueta({
          id: modal.item.id,
          name,
          color: formColor,
        });
        setItems((prev) => prev.map((et) => (et.id === updated.id ? updated : et)));
      } else {
        const created = await createEtiqueta({ name, color: formColor });
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
      await deleteEtiqueta({ id });
      setItems((prev) => prev.filter((et) => et.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* mock — ignore */
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading ? "…" : `${total} etiqueta${total === 1 ? "" : "s"}`;

  return (
    <InternasTemplate
      active="etiquetas"
      title="Etiqueta"
      countLabel={countLabel}
      pageId="etiqueta-page"
      ariaLabel="Etiqueta"
      searchPlaceholder="Buscar etiqueta"
      searchValue={query}
      onSearchChange={(value) => {
        setPage(1);
        setQuery(value);
      }}
      addId="etiqueta-add-btn"
      addLabel="Adicionar etiqueta"
      onAdd={openCreate}
    >
      <div
        className="page-panel__list"
        id="etiqueta-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando etiquetas" : undefined}
      >
        {loading ? (
          <div className="etiqueta-grid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="etiqueta-card etiqueta-row--skeleton">
                <span className="skeleton skeleton--line" style={{ width: "70%", height: 24, borderRadius: 8 }} />
                <div className="etiqueta-card__actions">
                  <span className="skeleton contact-row__skeleton-action" />
                  <span className="skeleton contact-row__skeleton-action" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="page-panel__empty">Nenhuma etiqueta encontrada.</p>
        ) : (
          <div className="etiqueta-grid" id="etiqueta-grid">
            {items.map((et) => (
              <article key={et.id} className="etiqueta-card" data-etiqueta-id={et.id} role="listitem">
                <span className="etiqueta-chip" style={{ ["--etiqueta-color" as string]: et.color }}>
                  <span className="etiqueta-chip__bar" aria-hidden="true" />
                  <span className="etiqueta-chip__name">{et.name}</span>
                </span>
                <div className="etiqueta-card__actions">
                  <button
                    type="button"
                    className="etiqueta-card__action"
                    aria-label="Editar"
                    title="Editar"
                    onClick={() => openEdit(et)}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    type="button"
                    className="etiqueta-card__action etiqueta-card__action--danger"
                    aria-label="Remover"
                    title="Remover"
                    onClick={() => setPendingDelete(et)}
                  >
                    <Icons.X />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {!loading && total > PAGE_SIZE ? (
        <div className="internas-pagination">
          <button
            type="button"
            className="internas-pagination__btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="internas-pagination__info">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="internas-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        </div>
      ) : null}

      {modal.open ? (
        <div className="page-modal is-open" id="etiqueta-modal">
          <div className="page-modal__backdrop" />
          <div
            className="page-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button type="button" className="page-modal__close" aria-label="Fechar" onClick={closeModal}>
              <Icons.X />
            </button>

            <h2 className="page-modal__title" id={titleId}>
              {modal.mode === "edit" ? "Editar etiqueta" : "Nova etiqueta"}
            </h2>

            <form className="contact-form" autoComplete="off" onSubmit={handleSubmit}>
              <div className="contact-field departamento-name-row">
                <span className="contact-field__label">Nome</span>
                <div className="departamento-name-row__fields">
                  <input
                    ref={nameRef}
                    type="text"
                    id="etiqueta-name"
                    name="name"
                    value={formName}
                    required
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <ColorPresetPicker
                    colors={ETIQUETA_COLORS}
                    value={formColor}
                    label="Cor da etiqueta"
                    disabled={saving}
                    onChange={setFormColor}
                  />
                </div>
              </div>

              {formError ? <p className="etiqueta-form__error">{formError}</p> : null}

              <div className="contact-form__actions">
                <button
                  type="button"
                  className="contact-form__btn contact-form__btn--ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="contact-form__btn contact-form__btn--primary" disabled={saving}>
                  {saving ? "Salvando…" : modal.mode === "edit" ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remover etiqueta?"
        description={
          pendingDelete
            ? `A etiqueta "${pendingDelete.name}" será removida. Essa ação não pode ser desfeita.`
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
