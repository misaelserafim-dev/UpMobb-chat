import { useEffect, useEffectEvent, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { useDismissable } from "@/hooks/useDismissable.ts";
import { fetchContacts, type Contact } from "@/services/contacts.ts";
import { listDepartamentos, type Departamento } from "@/services/departamentos.ts";
import { listEtiquetas, type Etiqueta } from "@/services/etiquetas.ts";
import { createChat } from "@/services/chats.ts";
import type { NewTicketModalProps } from "./NewTicketModal.ts";
import "./NewTicketModal.css";

export function NewTicketModal({
  open = false,
  initialContact = null,
  onClose,
  onCreated,
}: NewTicketModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const contactWrapRef = useRef<HTMLDivElement>(null);
  const etiquetaSelectRef = useRef<HTMLDivElement>(null);

  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const debouncedContactQuery = useDebouncedValue(contactQuery, 350);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [departamentoId, setDepartamentoId] = useState("");
  const [etiquetaId, setEtiquetaId] = useState("");
  const [etiquetaMenuOpen, setEtiquetaMenuOpen] = useState(false);
  const [etiquetaSearch, setEtiquetaSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);

  const selectedEtiqueta = etiquetas.find((e) => e.id === etiquetaId) || null;
  const filteredEtiquetas = etiquetas.filter((e) =>
    e.name.toLowerCase().includes(etiquetaSearch.trim().toLowerCase()),
  );

  const reset = useEffectEvent(() => {
    setContactQuery("");
    setContactResults([]);
    setContactLoading(false);
    setContactMenuOpen(false);
    setSelectedContact(null);
    setDepartamentoId("");
    setEtiquetaId("");
    setEtiquetaMenuOpen(false);
    setEtiquetaSearch("");
    setSaving(false);
    setFormError("");
  });

  const applyInitialContact = useEffectEvent((contact: Contact, tags: Etiqueta[]) => {
    setSelectedContact(contact);
    setContactQuery(contact.name);
    setContactMenuOpen(false);
    setContactResults([]);
    const firstTag = contact.tags?.[0];
    if (!firstTag) {
      setEtiquetaId("");
      return;
    }
    const match = tags.find(
      (e) =>
        e.id === firstTag.id || e.name.toLowerCase() === firstTag.label.toLowerCase(),
    );
    setEtiquetaId(match?.id || "");
  });

  useDismissable({
    open,
    onDismiss: () => {
      if (saving) return;
      onClose?.();
    },
    refs: [dialogRef],
  });

  useDismissable({
    open: contactMenuOpen,
    onDismiss: () => setContactMenuOpen(false),
    refs: [contactWrapRef],
  });

  useDismissable({
    open: etiquetaMenuOpen,
    onDismiss: () => setEtiquetaMenuOpen(false),
    refs: [etiquetaSelectRef],
  });

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    let cancelled = false;

    Promise.all([listDepartamentos(), listEtiquetas()])
      .then(([depts, tags]) => {
        if (cancelled) return;
        setDepartamentos(depts);
        setEtiquetas(tags);
        if (initialContact) applyInitialContact(initialContact, tags);
      })
      .catch(() => {
        if (cancelled) return;
        setDepartamentos([]);
        setEtiquetas([]);
      });

    if (!initialContact) {
      const t = window.setTimeout(() => contactInputRef.current?.focus(), 40);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [open, initialContact]);

  useEffect(() => {
    if (!open || selectedContact) return;
    const q = debouncedContactQuery.trim();
    if (q.length < 1) {
      setContactResults([]);
      setContactLoading(false);
      return;
    }

    let cancelled = false;
    setContactLoading(true);
    fetchContacts({ page: 1, pageSize: 12, query: q })
      .then((res) => {
        if (cancelled) return;
        setContactResults(res.items);
        setContactLoading(false);
        setContactMenuOpen(true);
      })
      .catch(() => {
        if (cancelled) return;
        setContactResults([]);
        setContactLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedContactQuery, open, selectedContact]);

  if (!open) return null;

  function pickContact(contact: Contact) {
    setSelectedContact(contact);
    setContactQuery(contact.name);
    setContactMenuOpen(false);
    setFormError("");
  }

  function clearContact() {
    setSelectedContact(null);
    setContactQuery("");
    setContactResults([]);
    setContactMenuOpen(false);
    window.setTimeout(() => contactInputRef.current?.focus(), 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!selectedContact) {
      setFormError("Selecione um contato para abrir o ticket.");
      return;
    }
    const dept = departamentos.find((d) => d.id === departamentoId);
    if (!dept) {
      setFormError("Selecione um departamento.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const chat = await createChat({
        contactId: selectedContact.id,
        name: selectedContact.name,
        phone: selectedContact.phone,
        avatar: selectedContact.avatar,
        departamentoId: dept.id,
        departamentoName: dept.name,
        departamentoColor: dept.color,
        etiquetaId: selectedEtiqueta?.id,
        etiquetaName: selectedEtiqueta?.name,
        etiquetaColor: selectedEtiqueta?.color,
      });
      onCreated?.(chat);
      onClose?.();
    } catch {
      setFormError("Não foi possível criar o ticket. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="new-ticket-modal" role="presentation">
      <div className="new-ticket-modal__backdrop" onClick={() => !saving && onClose?.()} />
      <div
        className="new-ticket-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        <button
          type="button"
          className="new-ticket-modal__close"
          aria-label="Fechar"
          disabled={saving}
          onClick={onClose}
        >
          <Icons.X />
        </button>

        <h2 className="new-ticket-modal__title" id={titleId}>
          Novo ticket
        </h2>

        <form className="new-ticket-modal__form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="contact-field new-ticket-modal__contact">
            <span className="contact-field__label">Contato</span>
            <div className="new-ticket-modal__contact-wrap" ref={contactWrapRef}>
              <div className="new-ticket-modal__contact-input">
                <Icons.Search size="xs" />
                <input
                  ref={contactInputRef}
                  type="search"
                  placeholder="Pesquisar contato"
                  aria-label="Pesquisar contato"
                  value={contactQuery}
                  disabled={Boolean(selectedContact) || saving}
                  onChange={(e) => {
                    setContactQuery(e.target.value);
                    setSelectedContact(null);
                    setContactMenuOpen(true);
                  }}
                  onFocus={() => {
                    if (!selectedContact && contactResults.length) setContactMenuOpen(true);
                  }}
                />
                {selectedContact ? (
                  <button
                    type="button"
                    className="new-ticket-modal__clear"
                    aria-label="Limpar contato"
                    onClick={clearContact}
                  >
                    <Icons.X size="xs" />
                  </button>
                ) : null}
              </div>

              {contactMenuOpen && !selectedContact ? (
                <div className="new-ticket-modal__menu" role="listbox">
                  {contactLoading ? (
                    <p className="new-ticket-modal__menu-empty">Buscando…</p>
                  ) : contactResults.length === 0 ? (
                    <p className="new-ticket-modal__menu-empty">
                      {contactQuery.trim() ? "Nenhum contato encontrado." : "Digite para pesquisar."}
                    </p>
                  ) : (
                    contactResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="new-ticket-modal__option"
                        role="option"
                        onClick={() => pickContact(c)}
                      >
                        <img className="new-ticket-modal__option-avatar" src={c.avatar} alt="" />
                        <span className="new-ticket-modal__option-meta">
                          <span className="new-ticket-modal__option-name">{c.name}</span>
                          <span className="new-ticket-modal__option-phone">{c.phone}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <label className="contact-field">
            <span className="contact-field__label">Departamento</span>
            <select
              className="new-ticket-modal__select"
              value={departamentoId}
              disabled={saving}
              onChange={(e) => setDepartamentoId(e.target.value)}
              required
            >
              <option value="">Selecionar departamento</option>
              {departamentos.map((d: Departamento) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <div className="contact-field">
            <span className="contact-field__label">Etiqueta</span>
            {!etiquetas.length ? (
              <p className="contact-etiqueta-picker__empty">Nenhuma etiqueta cadastrada.</p>
            ) : (
              <div
                className={`etiqueta-select${etiquetaMenuOpen ? " is-open" : ""}`}
                ref={etiquetaSelectRef}
              >
                <div
                  className="etiqueta-select__trigger"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="listbox"
                  aria-expanded={etiquetaMenuOpen}
                  onClick={() => {
                    if (saving) return;
                    setContactMenuOpen(false);
                    setEtiquetaMenuOpen((v) => !v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEtiquetaMenuOpen((v) => !v);
                    }
                  }}
                >
                  <span className="etiqueta-select__value">
                    {!selectedEtiqueta ? (
                      <span className="etiqueta-select__placeholder">Buscar etiqueta</span>
                    ) : (
                      <span
                        className="etiqueta-chip etiqueta-select__chip"
                        style={{ ["--etiqueta-color" as string]: selectedEtiqueta.color }}
                      >
                        <span className="etiqueta-chip__bar" aria-hidden="true" />
                        <span className="etiqueta-chip__name">{selectedEtiqueta.name}</span>
                        <button
                          type="button"
                          className="etiqueta-select__chip-remove"
                          aria-label={`Remover ${selectedEtiqueta.name}`}
                          title="Remover"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEtiquetaId("");
                          }}
                        >
                          <Icons.X />
                        </button>
                      </span>
                    )}
                  </span>
                  <span className="etiqueta-select__chevron" aria-hidden="true">
                    <Icons.ChevronDown />
                  </span>
                </div>

                {etiquetaMenuOpen ? (
                  <div
                    className="etiqueta-select__menu"
                    role="listbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="search"
                      className="etiqueta-select__search"
                      placeholder="Pesquisar etiqueta"
                      aria-label="Pesquisar etiqueta"
                      value={etiquetaSearch}
                      onChange={(e) => setEtiquetaSearch(e.target.value)}
                    />
                    <div className="etiqueta-select__list">
                      {filteredEtiquetas.map((et: Etiqueta) => {
                        const on = et.id === etiquetaId;
                        return (
                          <button
                            key={et.id}
                            type="button"
                            className={`etiqueta-select__option${on ? " is-active" : ""}`}
                            role="option"
                            aria-selected={on}
                            onClick={() => {
                              setEtiquetaId(et.id);
                              setEtiquetaMenuOpen(false);
                              setEtiquetaSearch("");
                            }}
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

          {formError ? <p className="new-ticket-modal__error">{formError}</p> : null}

          <div className="new-ticket-modal__actions">
            <button
              type="button"
              className="contact-form__btn contact-form__btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="contact-form__btn contact-form__btn--primary" disabled={saving}>
              {saving ? "Criando…" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
