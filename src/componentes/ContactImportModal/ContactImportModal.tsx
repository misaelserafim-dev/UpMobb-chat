import { createPortal } from "react-dom";
import type { ContactImportModalProps } from "./ContactImportModal.ts";
import "./ContactImportModal.css";

export function ContactImportModal({
  open = false,
  fileName = "",
  rows = [],
  replaceDuplicates = false,
  importing = false,
  error = "",
  onReplaceChange,
  onCancel,
  onConfirm,
}: ContactImportModalProps) {
  if (!open) return null;

  const news = rows.filter((r) => r.status === "new").length;
  const dups = rows.filter((r) => r.status === "duplicate").length;

  return createPortal(
    <div className="contact-import is-open">
      <div className="contact-import__backdrop" onClick={() => !importing && onCancel?.()} />
      <div
        className="contact-import__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-import-title"
      >
        <h2 className="contact-import__title" id="contact-import-title">
          Importar contatos
        </h2>
        <p className="contact-import__meta">
          {fileName ? <strong>{fileName}</strong> : null}
          {fileName ? " · " : null}
          {rows.length} linha{rows.length === 1 ? "" : "s"}
          {news ? ` · ${news} novo${news === 1 ? "" : "s"}` : ""}
          {dups ? ` · ${dups} duplicado${dups === 1 ? "" : "s"}` : ""}
        </p>

        {dups > 0 ? (
          <label className="contact-import__replace">
            <input
              type="checkbox"
              checked={replaceDuplicates}
              disabled={importing}
              onChange={(e) => onReplaceChange?.(e.target.checked)}
            />
            <span>
              Substituir dados dos contatos iguais (mesmo telefone)
            </span>
          </label>
        ) : (
          <p className="contact-import__hint">Nenhum telefone duplicado encontrado.</p>
        )}

        <div className="contact-import__table-wrap">
          <table className="contact-import__table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((row) => (
                <tr key={row.key} className={row.status === "duplicate" ? "is-dup" : ""}>
                  <td>
                    <span className={`contact-import__badge contact-import__badge--${row.status}`}>
                      {row.status === "duplicate" ? "Duplicado" : "Novo"}
                    </span>
                  </td>
                  <td>{row.name}</td>
                  <td>{row.phone || "—"}</td>
                  <td>{row.email || "—"}</td>
                  <td>{row.tagLabels.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 80 ? (
            <p className="contact-import__more">Mostrando 80 de {rows.length} contatos no preview.</p>
          ) : null}
        </div>

        {error ? <p className="contact-import__error">{error}</p> : null}

        <div className="contact-import__actions">
          <button
            type="button"
            className="contact-form__btn contact-form__btn--ghost"
            disabled={importing}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="contact-form__btn contact-form__btn--primary"
            disabled={importing || rows.length === 0}
            onClick={onConfirm}
          >
            {importing ? "Importando…" : "Confirmar importação"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
