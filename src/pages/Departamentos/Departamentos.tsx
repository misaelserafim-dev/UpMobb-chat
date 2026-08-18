import { useEffect, useRef, useState, type FormEvent } from "react";
import { ColorPresetPicker } from "@/componentes/ColorPresetPicker/ColorPresetPicker.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { FormActions } from "@/componentes/FormActions/FormActions.tsx";
import { PageModal } from "@/componentes/PageModal/PageModal.tsx";
import { Pagination } from "@/componentes/Pagination/Pagination.tsx";
import { RowActions } from "@/componentes/RowActions/RowActions.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import {
  createDepartamento,
  deleteDepartamento,
  fetchDepartamentos,
  updateDepartamento,
  type Departamento,
} from "@/services/departamentos.ts";
import {
  DEFAULT_DEPARTAMENTO_COLOR,
  DEPARTAMENTO_COLORS,
  resolvePresetColor,
} from "@/utils/presetColors.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "@/componentes/ColorPresetPicker/ColorPresetPicker.css";
import "./Departamentos.css";

const PAGE_SIZE = 40;

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; item: Departamento };

export function Departamentos() {
  const nameRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Departamento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(DEFAULT_DEPARTAMENTO_COLOR);
  const [formGreeting, setFormGreeting] = useState("");
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Departamento | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchDepartamentos({ page, pageSize: PAGE_SIZE, query })
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
    setFormColor(DEFAULT_DEPARTAMENTO_COLOR);
    setFormGreeting("");
    setFormError("");
    setModal({ open: true, mode: "create" });
  }

  function openEdit(item: Departamento) {
    setFormName(item.name);
    setFormColor(resolvePresetColor(item.color, DEPARTAMENTO_COLORS));
    setFormGreeting(item.greeting);
    setFormError("");
    setModal({ open: true, mode: "edit", item });
  }

  function closeModal() {
    if (saving) return;
    setModal({ open: false });
    setFormError("");
  }

  function matchesQuery(item: Departamento) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.greeting.toLowerCase().includes(q) ||
      item.color.toLowerCase().includes(q)
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    const greeting = formGreeting.trim();
    if (!name) {
      setFormError("Informe o nome do departamento.");
      return;
    }
    if (!greeting) {
      setFormError("Informe a mensagem de saudação.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modal.open && modal.mode === "edit") {
        const updated = await updateDepartamento({
          id: modal.item.id,
          name,
          color: formColor,
          greeting,
        });
        setItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      } else {
        const created = await createDepartamento({
          name,
          color: formColor,
          greeting,
        });
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
      await deleteDepartamento({ id });
      setItems((prev) => prev.filter((d) => d.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* mock — ignore */
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading
    ? "…"
    : `${total} departamento${total === 1 ? "" : "s"}`;

  return (
    <InternasTemplate
      active="departamentos"
      title="Departamento"
      countLabel={countLabel}
      pageId="departamento-page"
      ariaLabel="Departamento"
      searchPlaceholder="Buscar departamento"
      searchValue={query}
      onSearchChange={(value) => {
        setPage(1);
        setQuery(value);
      }}
      addId="departamento-add-btn"
      addLabel="Adicionar departamento"
      onAdd={openCreate}
      stickyTable
    >
      <div
        className="page-panel__list dept-table sticky-table"
        id="departamento-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando departamentos" : undefined}
      >
        {loading ? (
          <>
            <div className="dept-table__head" aria-hidden="true">
              <span className="dept-table__col dept-table__col--name">Nome</span>
              <span className="dept-table__col dept-table__col--color">Cor</span>
              <span className="dept-table__col dept-table__col--greeting">Mensagem de saudação</span>
              <span className="dept-table__col dept-table__col--actions">Ações</span>
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="dept-row dept-row--skeleton" aria-hidden="true">
                <span className="skeleton skeleton--line" style={{ width: "55%", height: 12 }} />
                <span className="skeleton" style={{ width: 22, height: 22, borderRadius: "50%" }} />
                <span className="skeleton skeleton--line" style={{ width: "80%", height: 10 }} />
                <div className="dept-row__actions">
                  <span className="skeleton contact-row__skeleton-action" />
                  <span className="skeleton contact-row__skeleton-action" />
                </div>
              </div>
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="page-panel__empty">Nenhum departamento encontrado.</p>
        ) : (
          <>
            <div className="dept-table__head" aria-hidden="true">
              <span className="dept-table__col dept-table__col--name">Nome</span>
              <span className="dept-table__col dept-table__col--color">Cor</span>
              <span className="dept-table__col dept-table__col--greeting">Mensagem de saudação</span>
              <span className="dept-table__col dept-table__col--actions">Ações</span>
            </div>
            {items.map((d) => (
              <article key={d.id} className="dept-row" data-departamento-id={d.id} role="listitem">
                <div className="dept-row__name">{d.name}</div>
                <div className="dept-row__color">
                  <span
                    className="dept-swatch"
                    style={{ ["--dept-color" as string]: d.color }}
                    title={d.color}
                  />
                </div>
                <div className="dept-row__greeting" title={d.greeting || ""}>
                  {d.greeting || "—"}
                </div>
                <RowActions
                  className="dept-row__actions"
                  onEdit={() => openEdit(d)}
                  onDelete={() => setPendingDelete(d)}
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
          id="departamento-modal"
          title={modal.mode === "edit" ? "Editar departamento" : "Novo departamento"}
          onClose={closeModal}
        >
            <form className="contact-form" autoComplete="off" onSubmit={handleSubmit}>
              <div className="contact-field departamento-name-row">
                <span className="contact-field__label">Nome</span>
                <div className="departamento-name-row__fields">
                  <input
                    ref={nameRef}
                    type="text"
                    id="departamento-name"
                    name="name"
                    value={formName}
                    required
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <ColorPresetPicker
                    colors={DEPARTAMENTO_COLORS}
                    value={formColor}
                    label="Cor do departamento"
                    disabled={saving}
                    columns={4}
                    onChange={setFormColor}
                  />
                </div>
              </div>

              <label className="contact-field">
                <span className="contact-field__label">Mensagem de saudação</span>
                <textarea
                  id="departamento-greeting"
                  name="greeting"
                  rows={4}
                  required
                  value={formGreeting}
                  onChange={(e) => setFormGreeting(e.target.value)}
                />
              </label>

              {formError ? <p className="dept-form__error">{formError}</p> : null}

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
        title="Remover departamento?"
        description={
          pendingDelete
            ? `O departamento "${pendingDelete.name}" será removido. Essa ação não pode ser desfeita.`
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
