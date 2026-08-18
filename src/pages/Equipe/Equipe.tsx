import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { EtiquetaSelect } from "@/componentes/EtiquetaSelect/EtiquetaSelect.tsx";
import { FormActions } from "@/componentes/FormActions/FormActions.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { LetterAvatar } from "@/componentes/LetterAvatar/LetterAvatar.tsx";
import { PageModal } from "@/componentes/PageModal/PageModal.tsx";
import { Pagination } from "@/componentes/Pagination/Pagination.tsx";
import { RowActions } from "@/componentes/RowActions/RowActions.tsx";
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
  const [formError, setFormError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<EquipeMember | null>(null);

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

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

    let cancelled = false;
    listDepartamentos()
      .then((items) => {
        if (!cancelled) setDepartamentos(items);
      })
      .catch(() => {
        if (!cancelled) setDepartamentos([]);
      });

    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
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
      stickyTable
    >
      <div
        className="page-panel__list equipe-table sticky-table"
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
                <RowActions
                  className="equipe-row__actions"
                  onEdit={() => openEdit(m)}
                  onDelete={() => setPendingDelete(m)}
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
          id="equipe-modal"
          wide
          title={modal.mode === "edit" ? "Editar membro" : "Novo membro da equipe"}
          onClose={closeModal}
        >
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
                    <EtiquetaSelect
                      id="equipe-dept-select"
                      items={departamentos}
                      value={formDeptIds}
                      onChange={setFormDeptIds}
                      placeholder="Selecionar departamentos"
                      searchPlaceholder="Pesquisar departamento"
                      emptyMessage="Nenhum departamento cadastrado."
                      menuPlacement="above"
                    />
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
