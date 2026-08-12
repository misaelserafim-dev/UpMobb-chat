import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { LetterAvatar } from "@/componentes/LetterAvatar/LetterAvatar.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import { listDepartamentos, type Departamento } from "@/services/departamentos.ts";
import {
  EQUIPE_CONNECTIONS,
  EQUIPE_PERMISSIONS,
  EQUIPE_PROFILES,
  connectionLabel,
  createEquipeMember,
  deleteEquipeMember,
  emptyEquipePermissions,
  fetchEquipe,
  profileLabel,
  updateEquipeMember,
  type EquipeMember,
  type EquipePermissionId,
  type EquipePermissions,
  type EquipeProfileId,
} from "@/services/equipe.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "./Equipe.css";

const PAGE_SIZE = 40;

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; item: EquipeMember };

const PERMISSION_ICONS: Record<string, ReactNode> = {
  history: <Icons.History />,
  messages: <Icons.Messages />,
  ticketOff: <Icons.TicketOff />,
  eye: <Icons.Eye />,
  edit: <Icons.Edit />,
  reply: <Icons.Reply />,
  users: <Icons.Users />,
};

export function Equipe() {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<EquipeMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formConnectionId, setFormConnectionId] = useState("");
  const [formProfile, setFormProfile] = useState<EquipeProfileId>("user");
  const [formDeptIds, setFormDeptIds] = useState<string[]>([]);
  const [formPermissions, setFormPermissions] = useState<EquipePermissions>(emptyEquipePermissions);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<EquipeMember | null>(null);

  const departamentos = useMemo(() => listDepartamentos(), [modal.open]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchEquipe({ page, pageSize: PAGE_SIZE, query })
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

  function resetForm(item?: EquipeMember) {
    setFormName(item?.name || "");
    setFormEmail(item?.email || "");
    setFormPassword("");
    setPasswordVisible(false);
    setFormConnectionId(item?.connectionId || "");
    setFormProfile(item?.profile || "user");
    setFormDeptIds(item?.departamentoIds ? [...item.departamentoIds] : []);
    setFormPermissions(item ? { ...emptyEquipePermissions(), ...item.permissions } : emptyEquipePermissions());
    setDeptMenuOpen(false);
    setDeptSearch("");
    setFormError("");
  }

  function openCreate() {
    resetForm();
    setModal({ open: true, mode: "create" });
  }

  function openEdit(item: EquipeMember) {
    resetForm(item);
    setModal({ open: true, mode: "edit", item });
  }

  function closeModal() {
    if (saving) return;
    setModal({ open: false });
    setFormError("");
    setDeptMenuOpen(false);
  }

  function matchesQuery(item: EquipeMember) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.profile.toLowerCase().includes(q)
    );
  }

  function toggleDept(id: string) {
    setFormDeptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function togglePermission(id: EquipePermissionId) {
    setFormPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    const email = formEmail.trim();
    if (!name) {
      setFormError("Informe o nome.");
      return;
    }
    if (!email) {
      setFormError("Informe o e-mail.");
      return;
    }
    if (!formConnectionId) {
      setFormError("Selecione a conexão.");
      return;
    }
    if (modal.open && modal.mode === "create" && !formPassword) {
      setFormError("Informe a senha.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modal.open && modal.mode === "edit") {
        const updated = await updateEquipeMember({
          id: modal.item.id,
          name,
          email,
          password: formPassword || undefined,
          connectionId: formConnectionId,
          profile: formProfile,
          departamentoIds: formDeptIds,
          permissions: formPermissions,
        });
        setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        const created = await createEquipeMember({
          name,
          email,
          password: formPassword,
          connectionId: formConnectionId,
          profile: formProfile,
          departamentoIds: formDeptIds,
          permissions: formPermissions,
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
      await deleteEquipeMember({ id });
      setItems((prev) => prev.filter((m) => m.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* mock — ignore */
    }
  }

  const selectedDepts = departamentos.filter((d) => formDeptIds.includes(d.id));
  const filteredDepts = departamentos.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.trim().toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading ? "…" : `${total} membro${total === 1 ? "" : "s"}`;

  return (
    <InternasTemplate
      active="equipe"
      title="Equipe"
      countLabel={countLabel}
      pageId="equipe-page"
      ariaLabel="Equipe"
      searchPlaceholder="Buscar equipe"
      searchValue={query}
      onSearchChange={(value) => {
        setPage(1);
        setQuery(value);
      }}
      addId="equipe-add-btn"
      addLabel="Adicionar membro"
      onAdd={openCreate}
    >
      <div
        className="page-panel__list equipe-table"
        id="equipe-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando equipe" : undefined}
      >
        {loading ? (
          <>
            <div className="equipe-table__head" aria-hidden="true">
              <span className="equipe-table__col">Nome</span>
              <span className="equipe-table__col">E-mail</span>
              <span className="equipe-table__col">Perfil</span>
              <span className="equipe-table__col">Conexão</span>
              <span className="equipe-table__col equipe-table__col--actions">Ações</span>
            </div>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="equipe-row equipe-row--skeleton" aria-hidden="true">
                <span className="skeleton skeleton--line" style={{ width: "55%", height: 12 }} />
                <span className="skeleton skeleton--line" style={{ width: "70%", height: 10 }} />
                <span className="skeleton skeleton--line" style={{ width: "40%", height: 10 }} />
                <span className="skeleton skeleton--line" style={{ width: "60%", height: 10 }} />
                <div className="equipe-row__actions">
                  <span className="skeleton contact-row__skeleton-action" />
                  <span className="skeleton contact-row__skeleton-action" />
                </div>
              </div>
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="page-panel__empty">Nenhum membro da equipe encontrado.</p>
        ) : (
          <>
            <div className="equipe-table__head" aria-hidden="true">
              <span className="equipe-table__col">Nome</span>
              <span className="equipe-table__col">E-mail</span>
              <span className="equipe-table__col">Perfil</span>
              <span className="equipe-table__col">Conexão</span>
              <span className="equipe-table__col equipe-table__col--actions">Ações</span>
            </div>
            {items.map((m) => (
              <article key={m.id} className="equipe-row" data-equipe-id={m.id} role="listitem">
                <div className="equipe-row__name">
                  <LetterAvatar name={m.name} status={m.status} />
                  <span className="equipe-row__name-text">{m.name}</span>
                </div>
                <div className="equipe-row__email">{m.email || "—"}</div>
                <div className="equipe-row__profile">{profileLabel(m.profile)}</div>
                <div className="equipe-row__connection">{connectionLabel(m.connectionId)}</div>
                <div className="equipe-row__actions">
                  <button
                    type="button"
                    className="contact-row__action"
                    aria-label="Editar"
                    title="Editar"
                    onClick={() => openEdit(m)}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    type="button"
                    className="contact-row__action contact-row__action--danger"
                    aria-label="Deletar"
                    title="Deletar"
                    onClick={() => setPendingDelete(m)}
                  >
                    <Icons.X />
                  </button>
                </div>
              </article>
            ))}
          </>
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
        <div className="page-modal is-open" id="equipe-modal">
          <div className="page-modal__backdrop" onClick={closeModal} />
          <div
            className="page-modal__dialog page-modal__dialog--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button type="button" className="page-modal__close" aria-label="Fechar" onClick={closeModal}>
              <Icons.X />
            </button>

            <h2 className="page-modal__title" id={titleId}>
              {modal.mode === "edit" ? "Editar membro" : "Novo membro da equipe"}
            </h2>

            <form className="equipe-form" autoComplete="off" onSubmit={handleSubmit}>
              <div className="equipe-form__layout">
                <div className="equipe-form__fields">
                  <label className="contact-field">
                    <span className="contact-field__label">Nome</span>
                    <input
                      ref={nameRef}
                      type="text"
                      id="equipe-name"
                      name="name"
                      value={formName}
                      required
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </label>

                  <label className="contact-field">
                    <span className="contact-field__label">Senha</span>
                    <div className="password-field">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="equipe-password"
                        name="password"
                        value={formPassword}
                        required={modal.mode === "create"}
                        placeholder={modal.mode === "edit" ? "Deixe em branco para manter" : ""}
                        autoComplete="new-password"
                        onChange={(e) => setFormPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-field__toggle"
                        aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                        title={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setPasswordVisible((v) => !v)}
                      >
                        {passwordVisible ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </label>

                  <label className="contact-field">
                    <span className="contact-field__label">E-mail</span>
                    <input
                      type="email"
                      id="equipe-email"
                      name="email"
                      value={formEmail}
                      required
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </label>

                  <label className="contact-field">
                    <span className="contact-field__label">Conexão</span>
                    <select
                      id="equipe-connection"
                      name="connection"
                      required
                      value={formConnectionId}
                      onChange={(e) => setFormConnectionId(e.target.value)}
                    >
                      <option value="">Selecionar conexão</option>
                      {EQUIPE_CONNECTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="contact-field">
                    <span className="contact-field__label">Perfil</span>
                    <select
                      id="equipe-profile"
                      name="profile"
                      required
                      value={formProfile}
                      onChange={(e) => setFormProfile(e.target.value as EquipeProfileId)}
                    >
                      {EQUIPE_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="contact-field">
                    <span className="contact-field__label">Departamentos</span>
                    {!departamentos.length ? (
                      <p className="contact-etiqueta-picker__empty">Nenhum departamento cadastrado.</p>
                    ) : (
                      <div className="etiqueta-select" id="equipe-dept-select">
                        <div
                          className="etiqueta-select__trigger"
                          role="button"
                          tabIndex={0}
                          aria-haspopup="listbox"
                          aria-expanded={deptMenuOpen}
                          onClick={() => setDeptMenuOpen((v) => !v)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDeptMenuOpen((v) => !v);
                            }
                          }}
                        >
                          <span className="etiqueta-select__value">
                            {selectedDepts.length === 0 ? (
                              <span className="etiqueta-select__placeholder">Selecionar departamentos</span>
                            ) : (
                              selectedDepts.map((d) => (
                                <span
                                  key={d.id}
                                  className="etiqueta-chip etiqueta-select__chip"
                                  style={{ ["--etiqueta-color" as string]: d.color }}
                                >
                                  <span className="etiqueta-chip__bar" aria-hidden="true" />
                                  <span className="etiqueta-chip__name">{d.name}</span>
                                  <button
                                    type="button"
                                    className="etiqueta-select__chip-remove"
                                    aria-label={`Remover ${d.name}`}
                                    title="Remover"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFormDeptIds((prev) => prev.filter((id) => id !== d.id));
                                    }}
                                  >
                                    <Icons.X />
                                  </button>
                                </span>
                              ))
                            )}
                          </span>
                          <span className="etiqueta-select__chevron" aria-hidden="true">
                            <Icons.ChevronDown />
                          </span>
                        </div>

                        {deptMenuOpen ? (
                          <div
                            className="etiqueta-select__menu"
                            role="listbox"
                            aria-multiselectable="true"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="search"
                              className="etiqueta-select__search"
                              placeholder="Pesquisar departamento"
                              aria-label="Pesquisar departamento"
                              value={deptSearch}
                              onChange={(e) => setDeptSearch(e.target.value)}
                            />
                            <button
                              type="button"
                              className="etiqueta-select__clear"
                              hidden={formDeptIds.length === 0}
                              onClick={() => setFormDeptIds([])}
                            >
                              Limpar seleção
                            </button>
                            <div className="etiqueta-select__list">
                              {filteredDepts.map((d: Departamento) => {
                                const on = formDeptIds.includes(d.id);
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    className={`etiqueta-select__option${on ? " is-active" : ""}`}
                                    role="option"
                                    aria-selected={on}
                                    onClick={() => toggleDept(d.id)}
                                  >
                                    <span className="etiqueta-select__check" aria-hidden="true" />
                                    <span
                                      className="etiqueta-chip"
                                      style={{ ["--etiqueta-color" as string]: d.color }}
                                    >
                                      <span className="etiqueta-chip__bar" aria-hidden="true" />
                                      <span className="etiqueta-chip__name">{d.name}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <aside className="equipe-form__permissions" aria-label="Permissões">
                  <div className="equipe-permissions__label">Permissões</div>
                  <div className="equipe-permissions__list">
                    {EQUIPE_PERMISSIONS.map((p) => (
                      <label key={p.id} className="equipe-permission">
                        <span className="equipe-permission__icon" aria-hidden="true">
                          {PERMISSION_ICONS[p.icon] || <Icons.Users />}
                        </span>
                        <span className="equipe-permission__meta">
                          <span className="equipe-permission__title">{p.title}</span>
                          <span className="equipe-permission__desc">{p.description}</span>
                        </span>
                        <span className="equipe-switch">
                          <input
                            type="checkbox"
                            name="permission"
                            value={p.id}
                            checked={Boolean(formPermissions[p.id])}
                            onChange={() => togglePermission(p.id)}
                          />
                          <span className="equipe-switch__track" aria-hidden="true" />
                        </span>
                      </label>
                    ))}
                  </div>
                </aside>
              </div>

              {formError ? <p className="equipe-form__error">{formError}</p> : null}

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
        title="Remover membro?"
        description={
          pendingDelete
            ? `${pendingDelete.name} será removido da equipe. Essa ação não pode ser desfeita.`
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
