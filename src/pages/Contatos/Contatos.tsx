import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ContatosSkeleton } from "@/componentes/ContatosSkeleton/ContatosSkeleton.tsx";
import { ContactImportModal } from "@/componentes/ContactImportModal/ContactImportModal.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { InternasTemplate } from "@/templates/Internas/InternasTemplate.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { NewTicketModal } from "@/componentes/NewTicketModal/NewTicketModal.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import {
  createContact,
  deleteContact,
  fetchContacts,
  updateContact,
  type Contact,
  type ContactTag,
} from "@/services/contacts.ts";
import { createEtiqueta, listEtiquetas, type Etiqueta } from "@/services/etiquetas.ts";
import { DIAL_CODES, getDialCode } from "@/utils/dialCodes.ts";
import {
  ensureImportEtiquetas,
  fetchAllContactsForImport,
  parseContactsWorkbook,
  resolveRowTags,
  type ImportContactDraft,
} from "@/utils/contactImport.ts";
import { maskPhone, phonePlaceholder } from "@/utils/phone.ts";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "@/componentes/ContactImportModal/ContactImportModal.css";
import "@/componentes/NewTicketModal/NewTicketModal.css";
import "./Contatos.css";

const PAGE_SIZE = 40;

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; item: Contact };

function parseStoredPhone(phone: string): { iso: string; dial: string; national: string } {
  const trimmed = phone.trim();
  const sorted = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const code of sorted) {
    if (trimmed.startsWith(code.dial)) {
      const rest = trimmed.slice(code.dial.length).trim();
      return { iso: code.iso, dial: code.dial, national: maskPhone(rest, code.dial) };
    }
  }
  return { iso: "BR", dial: "+55", national: maskPhone(trimmed, "+55") };
}

function formatContactPhone(phone: string) {
  const parsed = parseStoredPhone(phone);
  return `${parsed.dial} ${parsed.national}`.trim();
}

function contactInitial(name = "") {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toLocaleUpperCase("pt-BR");
}

function ContactRowAvatar({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImg = Boolean(src) && !failed;

  if (!showImg) {
    return (
      <span className="contact-row__avatar contact-row__avatar--fallback" aria-hidden="true">
        {contactInitial(name)}
      </span>
    );
  }

  return (
    <img
      className="contact-row__avatar"
      src={src}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

export function Contatos() {
  const navigate = useNavigate();
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const ddiRef = useRef<HTMLDivElement>(null);
  const tagSelectRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [dialIso, setDialIso] = useState("BR");
  const [ddiOpen, setDdiOpen] = useState(false);
  const [ddiSearch, setDdiSearch] = useState("");

  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketContact, setTicketContact] = useState<Contact | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importRows, setImportRows] = useState<ImportContactDraft[]>([]);
  const [replaceDuplicates, setReplaceDuplicates] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const selectedDial = useMemo(() => getDialCode("+55", dialIso), [dialIso]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);

  useDismissable({
    open: ddiOpen,
    onDismiss: () => setDdiOpen(false),
    refs: [ddiRef],
  });

  useDismissable({
    open: tagMenuOpen,
    onDismiss: () => setTagMenuOpen(false),
    refs: [tagSelectRef],
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchContacts({ page, pageSize: PAGE_SIZE, query })
        .then((res) => {
          if (cancelled) return;
          setContacts(res.items);
          setTotal(res.total);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setContacts([]);
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
    listEtiquetas()
      .then((items) => {
        if (!cancelled) setEtiquetas(items);
      })
      .catch(() => {
        if (!cancelled) setEtiquetas([]);
      });

    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [modal]);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormNotes("");
    setFormPhone("");
    setDialIso("BR");
    setDdiOpen(false);
    setDdiSearch("");
    setTagIds([]);
    setTagMenuOpen(false);
    setTagSearch("");
    setFormError("");
  }

  function openCreate() {
    resetForm();
    setModal({ open: true, mode: "create" });
  }

  function openEdit(item: Contact) {
    const parsed = parseStoredPhone(item.phone);
    setFormName(item.name);
    setFormEmail(item.email || "");
    setFormNotes(item.notes || "");
    setDialIso(parsed.iso);
    setFormPhone(parsed.national);
    setDdiOpen(false);
    setDdiSearch("");
    setTagIds((item.tags || []).map((t) => t.id));
    setTagMenuOpen(false);
    setTagSearch("");
    setFormError("");
    setModal({ open: true, mode: "edit", item });
  }

  function closeModal() {
    if (saving) return;
    setModal({ open: false });
    setFormError("");
    setDdiOpen(false);
    setTagMenuOpen(false);
  }

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    try {
      await deleteContact({ id });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      /* mock — ignore */
    }
  }

  function isImportFile(file: File | undefined | null) {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return (
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      name.endsWith(".csv") ||
      file.type.includes("sheet") ||
      file.type.includes("excel") ||
      file.type === "text/csv"
    );
  }

  async function openImportPreview(file: File) {
    setImportError("");
    setImportFileName(file.name);
    setReplaceDuplicates(false);
    try {
      const [existing, tags] = await Promise.all([
        fetchAllContactsForImport(fetchContacts),
        listEtiquetas().catch(() => [] as Etiqueta[]),
      ]);
      setEtiquetas(tags);
      const rows = await parseContactsWorkbook(file, existing, tags);
      if (!rows.length) {
        setImportError("Nenhum contato válido encontrado no arquivo.");
        setImportRows([]);
        setImportOpen(true);
        return;
      }
      setImportRows(rows);
      setImportOpen(true);
    } catch {
      setImportError("Não foi possível ler o arquivo. Use .xlsx, .xls ou .csv.");
      setImportRows([]);
      setImportOpen(true);
    }
  }

  function closeImport() {
    if (importing) return;
    setImportOpen(false);
    setImportRows([]);
    setImportFileName("");
    setImportError("");
    setReplaceDuplicates(false);
    if (importInputRef.current) importInputRef.current.value = "";
  }

  async function confirmImport() {
    if (!importRows.length || importing) return;
    setImporting(true);
    setImportError("");

    try {
      let createdCount = 0;
      let updatedCount = 0;

      const rowsToApply = importRows.filter((row) => {
        if (row.status === "duplicate") return Boolean(replaceDuplicates && row.existingId);
        return true;
      });

      const currentTags = await listEtiquetas().catch(() => [] as Etiqueta[]);
      const tagCatalog = await ensureImportEtiquetas(
        rowsToApply.flatMap((row) => row.tagLabels),
        currentTags,
        createEtiqueta,
      );

      for (const row of rowsToApply) {
        const tags = resolveRowTags(row.tagLabels, tagCatalog);

        if (row.status === "duplicate") {
          if (!row.existingId) continue;
          await updateContact({
            id: row.existingId,
            name: row.name,
            phone: row.phone,
            dialCode: row.dialCode,
            email: row.email,
            notes: row.notes,
            tags,
          });
          updatedCount += 1;
          continue;
        }

        await createContact({
          name: row.name,
          phone: row.phone,
          dialCode: row.dialCode,
          email: row.email,
          notes: row.notes,
          tags,
        });
        createdCount += 1;
      }

      const refreshed = await fetchContacts({ page, pageSize: PAGE_SIZE, query });
      setContacts(refreshed.items);
      setTotal(refreshed.total);
      setImportOpen(false);
      setImportRows([]);
      setImportFileName("");
      setReplaceDuplicates(false);
      if (importInputRef.current) importInputRef.current.value = "";

      if (!createdCount && !updatedCount) {
        setImportError("Nada foi importado. Marque substituir duplicados se quiser atualizar os iguais.");
        setImportOpen(true);
      }
    } catch {
      setImportError("Falha ao importar alguns contatos. Tente de novo.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    const phoneNumber = formPhone.trim();
    if (!name) {
      setFormError("Informe o nome.");
      return;
    }
    if (!phoneNumber) {
      setFormError("Informe o telefone.");
      return;
    }

    const selectedTags: ContactTag[] = etiquetas
      .filter((et) => tagIds.includes(et.id))
      .map((et) => ({ id: et.id, label: et.name, color: et.color }));

    const phone = `${selectedDial.dial} ${phoneNumber}`.trim();

    setSaving(true);
    setFormError("");
    try {
      if (modal.open && modal.mode === "edit") {
        const updated = await updateContact({
          id: modal.item.id,
          name,
          phone,
          dialCode: selectedDial.dial,
          email: formEmail.trim() || undefined,
          notes: formNotes.trim() || undefined,
          tags: selectedTags,
        });
        setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createContact({
          name,
          phone,
          dialCode: selectedDial.dial,
          email: formEmail.trim() || undefined,
          notes: formNotes.trim() || undefined,
          tags: selectedTags,
        });

        if (page === 1) {
          setContacts((prev) => [created, ...prev].slice(0, PAGE_SIZE));
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

  const filteredDialCodes = DIAL_CODES.filter((c) => {
    const q = ddiSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const selectedTags = etiquetas.filter((et) => tagIds.includes(et.id));
  const filteredTags = etiquetas.filter((et) =>
    et.name.toLowerCase().includes(tagSearch.trim().toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countLabel = loading ? "…" : `${total} contato${total === 1 ? "" : "s"}`;

  useEffect(() => {
    function hasFiles(e: DragEvent) {
      return Array.from(e.dataTransfer?.types || []).includes("Files");
    }

    function enter(e: globalThis.DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setDragActive(true);
    }

    function leave(e: globalThis.DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setDragActive(false);
    }

    function over(e: globalThis.DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
    }

    function drop(e: globalThis.DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file || !isImportFile(file)) {
        setImportError("Envie um arquivo Excel (.xlsx / .xls) ou CSV.");
        setImportRows([]);
        setImportOpen(true);
        return;
      }
      void openImportPreview(file);
    }

    document.addEventListener("dragenter", enter);
    document.addEventListener("dragleave", leave);
    document.addEventListener("dragover", over);
    document.addEventListener("drop", drop);
    return () => {
      document.removeEventListener("dragenter", enter);
      document.removeEventListener("dragleave", leave);
      document.removeEventListener("dragover", over);
      document.removeEventListener("drop", drop);
    };
  }, []);

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void openImportPreview(file);
        }}
      />

      {dragActive ? (
        <div className="contatos-drop-overlay" aria-hidden="true">
          <div className="contatos-drop-overlay__card">
            <Icons.Upload />
            <strong>Solte o arquivo para importar</strong>
            <span>Excel (.xlsx) ou CSV</span>
          </div>
        </div>
      ) : null}

      <InternasTemplate
        active="contatos"
        title="Contatos"
        countLabel={countLabel}
        pageId="contatos-page"
        ariaLabel="Contatos"
        searchPlaceholder="Buscar contato"
        searchValue={query}
        onSearchChange={(value) => {
          setPage(1);
          setQuery(value);
        }}
        addId="contatos-add-btn"
        addLabel="Adicionar contato"
        onAdd={openCreate}
        importId="contatos-import-btn"
        importLabel="Importar contatos"
        onImport={() => importInputRef.current?.click()}
      >
      <div
        className="page-panel__list contact-table"
        id="contatos-list"
        role="list"
        aria-busy={loading || undefined}
        aria-label={loading ? "Carregando contatos" : undefined}
      >
        {loading ? (
          <ContatosSkeleton count={8} />
        ) : contacts.length === 0 ? (
          <p className="page-panel__empty">Nenhum contato encontrado.</p>
        ) : (
          <>
            <div className="contact-table__head" aria-hidden="true">
              <span className="contact-table__col contact-table__col--person">Contato</span>
              <span className="contact-table__col contact-table__col--label">Etiquetas</span>
              <span className="contact-table__col contact-table__col--actions">Ações</span>
            </div>
            {contacts.map((c) => (
              <article key={c.id} className="contact-row" data-contact-id={c.id} role="listitem">
                <div className="contact-row__person">
                  <ContactRowAvatar name={c.name} src={c.avatar} />
                  <div className="contact-row__meta">
                    <div className="contact-row__name">{c.name}</div>
                    <div className="contact-row__phone">{formatContactPhone(c.phone)}</div>
                  </div>
                </div>

                <div className="contact-row__etiqueta">
                  {c.tags?.length ? (
                    <div className="contact-etiqueta-list">
                      {c.tags.map((t) => (
                        <span
                          key={t.id}
                          className="etiqueta-chip contact-row__chip"
                          style={{ ["--etiqueta-color" as string]: t.color || "#9ca3af" }}
                        >
                          <span className="etiqueta-chip__bar" aria-hidden="true" />
                          <span className="etiqueta-chip__name">{t.label}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="contact-etiqueta contact-etiqueta--empty">—</span>
                  )}
                </div>

                <div className="contact-row__actions">
                  <button
                    type="button"
                    className="contact-row__action"
                    data-contact-action="whatsapp"
                    aria-label="WhatsApp"
                    title="Abrir ticket no WhatsApp"
                    onClick={() => {
                      setTicketContact(c);
                      setTicketOpen(true);
                    }}
                  >
                    <Icons.Whatsapp />
                  </button>
                  <button
                    type="button"
                    className="contact-row__action"
                    data-contact-action="editar"
                    aria-label="Editar"
                    title="Editar"
                    onClick={() => openEdit(c)}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    type="button"
                    className="contact-row__action contact-row__action--danger"
                    data-contact-action="deletar"
                    aria-label="Deletar"
                    title="Deletar"
                    onClick={() => setPendingDelete(c)}
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
        <div className="internas-pagination contatos-pagination">
          <button
            type="button"
            className="internas-pagination__btn contatos-pagination__btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="internas-pagination__info contatos-pagination__info">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="internas-pagination__btn contatos-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        </div>
      ) : null}

      {modal.open ? (
        <div className="page-modal is-open" id="contact-modal">
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
              {modal.mode === "edit" ? "Editar contato" : "Novo contato"}
            </h2>

            <form className="contact-form" autoComplete="off" onSubmit={handleSubmit}>
              <label className="contact-field">
                <span className="contact-field__label">Nome</span>
                <input
                  ref={nameRef}
                  type="text"
                  id="contact-add-name"
                  name="name"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>

              <div className="contact-field">
                <span className="contact-field__label">Telefone</span>
                <div className="phone-field">
                  <div className="phone-ddi" id="phone-ddi" ref={ddiRef}>
                    <button
                      type="button"
                      className="phone-ddi__trigger"
                      id="phone-ddi-btn"
                      aria-haspopup="listbox"
                      aria-expanded={ddiOpen}
                      onClick={() => {
                        setTagMenuOpen(false);
                        setDdiOpen((v) => !v);
                      }}
                    >
                      <span className="phone-ddi__flag">{selectedDial.flag}</span>
                      <span className="phone-ddi__chevron" aria-hidden="true">
                        <Icons.ChevronDown />
                      </span>
                      <span className="phone-ddi__code">{selectedDial.dial}</span>
                    </button>

                    {ddiOpen ? (
                      <div className="phone-ddi__menu" role="listbox">
                        <input
                          type="search"
                          className="phone-ddi__search"
                          placeholder="search"
                          aria-label="Buscar país"
                          value={ddiSearch}
                          onChange={(e) => setDdiSearch(e.target.value)}
                        />
                        <div className="phone-ddi__list">
                          {filteredDialCodes.map((c) => (
                            <button
                              key={`${c.iso}-${c.dial}`}
                              type="button"
                              className={`phone-ddi__option${
                                c.iso === selectedDial.iso ? " is-active" : ""
                              }`}
                              role="option"
                              aria-selected={c.iso === selectedDial.iso}
                              onClick={() => {
                                setDialIso(c.iso);
                                setFormPhone((prev) => maskPhone(prev, c.dial));
                                setDdiOpen(false);
                                setDdiSearch("");
                              }}
                            >
                              <span className="phone-ddi__flag">{c.flag}</span>
                              <span className="phone-ddi__name">{c.name}</span>
                              <span className="phone-ddi__dial">{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <input
                    type="tel"
                    id="contact-add-phone"
                    name="phone"
                    className="phone-field__number"
                    placeholder={phonePlaceholder(selectedDial.dial)}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(maskPhone(e.target.value, selectedDial.dial))}
                  />
                </div>
              </div>

              <label className="contact-field">
                <span className="contact-field__label">E-mail</span>
                <input
                  type="email"
                  id="contact-add-email"
                  name="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </label>

              <div className="contact-field">
                <span className="contact-field__label">Etiquetas</span>
                {!etiquetas.length ? (
                  <p className="contact-etiqueta-picker__empty">Nenhuma etiqueta cadastrada.</p>
                ) : (
                  <div className="etiqueta-select" id="contact-etiqueta-select" ref={tagSelectRef}>
                    <div
                      className="etiqueta-select__trigger"
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      aria-expanded={tagMenuOpen}
                      onClick={() => {
                        setDdiOpen(false);
                        setTagMenuOpen((v) => !v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setTagMenuOpen((v) => !v);
                        }
                      }}
                    >
                      <span className="etiqueta-select__value">
                        {selectedTags.length === 0 ? (
                          <span className="etiqueta-select__placeholder">Selecionar etiquetas</span>
                        ) : (
                          selectedTags.map((et) => (
                            <span
                              key={et.id}
                              className="etiqueta-chip etiqueta-select__chip"
                              style={{ ["--etiqueta-color" as string]: et.color }}
                            >
                              <span className="etiqueta-chip__bar" aria-hidden="true" />
                              <span className="etiqueta-chip__name">{et.name}</span>
                              <button
                                type="button"
                                className="etiqueta-select__chip-remove"
                                aria-label={`Remover ${et.name}`}
                                title="Remover"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTagIds((prev) => prev.filter((id) => id !== et.id));
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

                    {tagMenuOpen ? (
                      <div
                        className="etiqueta-select__menu"
                        role="listbox"
                        aria-multiselectable="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
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
                          hidden={tagIds.length === 0}
                          onClick={() => setTagIds([])}
                        >
                          Limpar seleção
                        </button>
                        <div className="etiqueta-select__list">
                          {filteredTags.map((et: Etiqueta) => {
                            const on = tagIds.includes(et.id);
                            return (
                              <button
                                key={et.id}
                                type="button"
                                className={`etiqueta-select__option${on ? " is-active" : ""}`}
                                role="option"
                                aria-selected={on}
                                onClick={() => toggleTag(et.id)}
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
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <label className="contact-field">
                <span className="contact-field__label">Observação</span>
                <textarea
                  id="contact-add-notes"
                  name="notes"
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </label>

              {formError ? <p className="contato-form__error">{formError}</p> : null}

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
        title="Remover contato?"
        description={
          pendingDelete
            ? `O contato "${pendingDelete.name}" será removido. Essa ação não pode ser desfeita.`
            : ""
        }
        cancelLabel="Cancelar"
        confirmLabel="Remover"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <NewTicketModal
        open={ticketOpen}
        initialContact={ticketContact}
        onClose={() => {
          setTicketOpen(false);
          setTicketContact(null);
        }}
        onCreated={(chat) => {
          setTicketOpen(false);
          setTicketContact(null);
          navigate("/", { state: { openChatId: chat.id } });
        }}
      />
    </InternasTemplate>

      <ContactImportModal
        open={importOpen}
        fileName={importFileName}
        rows={importRows}
        replaceDuplicates={replaceDuplicates}
        importing={importing}
        error={importError}
        onReplaceChange={setReplaceDuplicates}
        onCancel={closeImport}
        onConfirm={() => void confirmImport()}
      />
    </>
  );
}
