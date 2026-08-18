import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { FormActions } from "@/componentes/FormActions/FormActions.tsx";
import { PageModal } from "@/componentes/PageModal/PageModal.tsx";
import { Pagination } from "@/componentes/Pagination/Pagination.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import {
  connectConexao,
  createConexao,
  deleteConexao,
  disconnectConexao,
  fetchConexaoSession,
  fetchConexoes,
  type Conexao,
  type ConexaoSession,
  type SessionStatus,
} from "@/services/conexoes.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "./Conexoes.css";

const PAGE_SIZE = 40;
const QR_POLL_MS = 2000;
const PHONE_SENTINEL = "aguardando";
const CONNECT_FALLBACK = "Não foi possível conectar. Tente de novo.";

function situacaoLabel(status: SessionStatus): string {
  switch (status) {
    case "disconnected":
      return "Desconectado";
    case "connecting":
      return "Conectando";
    case "qr":
      return "Aguardando leitura";
    case "open":
      return "Conectado";
  }
}

function phoneLabel(item: Conexao): string {
  if (item.sessionStatus === "open" && item.phoneNumber && item.phoneNumber !== PHONE_SENTINEL) {
    return item.phoneNumber;
  }
  return "—";
}

function connectErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message && !err.message.startsWith("HTTP ")) {
    return err.message;
  }
  return CONNECT_FALLBACK;
}

function mergeSession(item: Conexao, session: ConexaoSession): Conexao {
  return {
    ...item,
    sessionStatus: session.sessionStatus,
    qrCode: session.qrCode,
    phoneNumber: session.phoneNumber,
  };
}

function sessionDone(session: ConexaoSession): boolean {
  return session.connected && session.sessionStatus === "open";
}

export function Conexoes() {
  const nameRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<number | null>(null);
  const qrIdRef = useRef<string | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Conexao[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");

  const [qrTarget, setQrTarget] = useState<Conexao | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Conexao | null>(null);
  const [pendingDisconnect, setPendingDisconnect] = useState<Conexao | null>(null);

  function stopPoll() {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function closeQrModal() {
    stopPoll();
    qrIdRef.current = null;
    setQrTarget(null);
    setQrCode(null);
    setQrError("");
  }

  function applySession(id: string, session: ConexaoSession) {
    setItems((prev) => prev.map((c) => (c.id === id ? mergeSession(c, session) : c)));
  }

  async function pollSession(id: string) {
    if (qrIdRef.current !== id) return;
    try {
      const session = await fetchConexaoSession(id);
      if (qrIdRef.current !== id) return;
      setQrCode(session.qrCode);
      applySession(id, session);
      if (sessionDone(session)) closeQrModal();
    } catch (err) {
      if (qrIdRef.current !== id) return;
      stopPoll();
      setQrError(connectErrorMessage(err));
    }
  }

  async function beginConnect(item: Conexao) {
    stopPoll();
    qrIdRef.current = item.id;
    setQrTarget(item);
    setQrCode(null);
    setQrError("");
    try {
      const session = await connectConexao(item.id);
      if (qrIdRef.current !== item.id) return;
      setQrCode(session.qrCode);
      applySession(item.id, session);
      if (sessionDone(session)) {
        closeQrModal();
        return;
      }
    } catch (err) {
      if (qrIdRef.current !== item.id) return;
      setQrError(connectErrorMessage(err));
      return;
    }
    stopPoll();
    pollRef.current = window.setInterval(() => {
      void pollSession(item.id);
    }, QR_POLL_MS);
  }

  useEffect(() => {
    return () => {
      qrIdRef.current = null;
      stopPoll();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchConexoes({ page, pageSize: PAGE_SIZE, query })
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
    if (!createOpen) return;
    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [createOpen]);

  function openCreate() {
    setFormName("");
    setFormError("");
    setCreateOpen(true);
  }

  function closeCreate() {
    if (saving) return;
    setCreateOpen(false);
    setFormError("");
  }

  function matchesQuery(item: Conexao) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Informe o nome.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const created = await createConexao({ name });
      if (matchesQuery(created) && page === 1) {
        setItems((prev) => [created, ...prev].slice(0, PAGE_SIZE));
      }
      setTotal((t) => t + 1);
      setCreateOpen(false);
      setSaving(false);
      await beginConnect(created);
    } catch {
      setFormError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  }

  async function confirmDisconnect() {
    if (!pendingDisconnect) return;
    const item = pendingDisconnect;
    setPendingDisconnect(null);
    try {
      const session = await disconnectConexao(item.id);
      applySession(item.id, session);
    } catch {
      /* ignore */
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    if (qrIdRef.current === id) closeQrModal();
    setPendingDelete(null);
    try {
      await deleteConexao({ id });
      setItems((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* ignore */
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading ? "…" : `${total} conexão${total === 1 ? "" : "ões"}`;

  return (
    <InternasTemplate
      active="conexoes"
      title="Conexão"
      countLabel={countLabel}
      pageId="conexoes-page"
      ariaLabel="Conexão"
      searchPlaceholder="Buscar conexão"
      searchValue={query}
      onSearchChange={(value) => {
        setPage(1);
        setQuery(value);
      }}
      addId="conexoes-add-btn"
      addLabel="Adicionar conexão"
      onAdd={openCreate}
    >
      <div
        className="page-panel__list equipe-table conexoes-table"
        id="conexoes-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando conexões" : undefined}
      >
        {loading ? (
          <>
            <div className="equipe-table__head" aria-hidden="true">
              <span className="equipe-table__col">Nome</span>
              <span className="equipe-table__col">Situação</span>
              <span className="equipe-table__col">Número</span>
              <span className="equipe-table__col equipe-table__col--actions">Ações</span>
            </div>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="equipe-row conexoes-row--skeleton" aria-hidden="true">
                <span className="skeleton skeleton--line" style={{ width: "55%", height: 12 }} />
                <span className="skeleton skeleton--line" style={{ width: "40%", height: 10 }} />
                <span className="skeleton skeleton--line" style={{ width: "50%", height: 10 }} />
                <div className="equipe-row__actions conexoes-row__actions">
                  <span className="skeleton contact-row__skeleton-action" />
                  <span className="skeleton contact-row__skeleton-action" />
                </div>
              </div>
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="page-panel__empty">Nenhuma conexão ainda.</p>
        ) : (
          <>
            <div className="equipe-table__head" aria-hidden="true">
              <span className="equipe-table__col">Nome</span>
              <span className="equipe-table__col">Situação</span>
              <span className="equipe-table__col">Número</span>
              <span className="equipe-table__col equipe-table__col--actions">Ações</span>
            </div>
            {items.map((c) => (
              <article key={c.id} className="equipe-row" data-conexao-id={c.id} role="listitem">
                <div className="equipe-row__name">
                  <span className="equipe-row__name-text">{c.name}</span>
                </div>
                <div className="conexoes-row__status">{situacaoLabel(c.sessionStatus)}</div>
                <div className="conexoes-row__phone">{phoneLabel(c)}</div>
                <div className="equipe-row__actions conexoes-row__actions">
                  {c.sessionStatus === "open" ? (
                    <button
                      type="button"
                      className="conexoes-row__btn"
                      onClick={() => setPendingDisconnect(c)}
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="conexoes-row__btn"
                      disabled={qrTarget?.id === c.id}
                      onClick={() => void beginConnect(c)}
                    >
                      Conectar
                    </button>
                  )}
                  <button
                    type="button"
                    className="conexoes-row__btn conexoes-row__btn--danger"
                    onClick={() => setPendingDelete(c)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </>
        )}
      </div>

      {!loading ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}

      {createOpen ? (
        <PageModal open id="conexoes-modal" title="Nova conexão" onClose={closeCreate}>
          <form className="contact-form" autoComplete="off" onSubmit={handleSubmit}>
            <label className="contact-field">
              <span className="contact-field__label">Nome</span>
              <input
                ref={nameRef}
                type="text"
                id="conexao-name"
                name="name"
                value={formName}
                required
                onChange={(e) => setFormName(e.target.value)}
              />
            </label>

            {formError ? <p className="conexoes-form__error">{formError}</p> : null}

            <FormActions
              onCancel={closeCreate}
              disabled={saving}
              submitLabel={saving ? "Salvando…" : "Adicionar"}
            />
          </form>
        </PageModal>
      ) : null}

      {qrTarget ? (
        <PageModal open id="conexoes-qr-modal" title={qrTarget.name} onClose={closeQrModal}>
          <div className="conexoes-qr">
            {qrCode ? <img src={qrCode} alt="" /> : null}
            <p className="conexoes-qr__copy">
              Abra o WhatsApp no celular, Aparelhos conectados, e leia o código.
            </p>
            {qrError ? <p className="conexoes-qr__error">{qrError}</p> : null}
          </div>
        </PageModal>
      ) : null}

      <ConfirmModal
        open={Boolean(pendingDisconnect)}
        title="Desconectar?"
        description={
          pendingDisconnect
            ? `${pendingDisconnect.name} será desconectada.`
            : ""
        }
        cancelLabel="Cancelar"
        confirmLabel="Desconectar"
        onCancel={() => setPendingDisconnect(null)}
        onConfirm={confirmDisconnect}
      />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remover conexão?"
        description={
          pendingDelete
            ? `${pendingDelete.name} será removida. Essa ação não pode ser desfeita.`
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
