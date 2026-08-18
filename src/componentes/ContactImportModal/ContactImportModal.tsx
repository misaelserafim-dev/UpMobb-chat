import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ContactImportModalProps } from "./ContactImportModal.ts";
import "./ContactImportModal.css";

const PAGE_SIZE = 40;

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
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, rows]);

  if (!open) return null;

  const news = rows.filter((r) => r.status === "new").length;
  const dups = rows.filter((r) => r.status === "duplicate").length;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

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
              {pageRows.map((row) => (
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
        </div>

        {rows.length > PAGE_SIZE ? (
          <div className="contact-import__pagination">
            <button
              type="button"
              className="contact-import__page-btn"
              disabled={importing || safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="contact-import__page-info">
              Página {safePage} de {totalPages}
            </span>
            <button
              type="button"
              className="contact-import__page-btn"
              disabled={importing || safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </button>
          </div>
        ) : null}

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
