import { Icons } from "../icons.js";
import { PageBackButton } from "../components/PageBackButton.js";
import { AddButton } from "../ui/AddButton.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function RespostaRapidaPage({
  respostas = [],
  searchQuery = "",
  modalOpen = false,
  editing = null,
} = {}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? respostas.filter(
        (r) =>
          (r.shortcut || "").toLowerCase().includes(q) ||
          (r.text || "").toLowerCase().includes(q)
      )
    : respostas;

  const list =
    filtered.length === 0
      ? `<p class="page-panel__empty">Nenhuma resposta rápida encontrada.</p>`
      : `
        <div class="quick-reply-table__head" aria-hidden="true">
          <span class="quick-reply-table__col quick-reply-table__col--shortcut">Atalho</span>
          <span class="quick-reply-table__col quick-reply-table__col--text">Resposta rápida</span>
          <span class="quick-reply-table__col quick-reply-table__col--actions">Ações</span>
        </div>
        ${filtered.map((r) => RespostaRapidaRow(r)).join("")}
      `;

  return `
    <main class="chat-window page-panel" id="resposta-rapida-page" aria-label="Resposta rápida">
      <header class="chat-window__header">
        <div class="page-container">
          <div class="chat-window__identity">
            ${PageBackButton()}
            <div class="chat-window__meta">
              <div class="chat-window__name">Resposta rápida</div>
              <div class="chat-window__assignee">
                ${filtered.length} resposta${filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div class="contatos-header-actions">
            <label class="page-panel__search page-panel__search--header">
              ${Icons.search}
              <input
                type="search"
                id="resposta-rapida-search"
                class="page-panel__search-input"
                placeholder="Buscar resposta"
                aria-label="Buscar resposta rápida"
                value="${escapeAttr(searchQuery)}"
              />
            </label>
            ${AddButton({
              id: "resposta-rapida-add-btn",
              label: "Adicionar resposta rápida",
            })}
          </div>
        </div>
      </header>

      <div class="page-panel__body">
        <div class="page-container page-container--contacts">
          <div class="page-panel__list quick-reply-table" id="resposta-rapida-list" role="list">
            ${list}
          </div>

          ${RespostaRapidaFormModal({ open: modalOpen, editing })}
        </div>
      </div>
    </main>
  `;
}

function RespostaRapidaRow(r) {
  return `
    <article class="quick-reply-row" data-resposta-id="${escapeAttr(r.id)}" role="listitem">
      <div class="quick-reply-row__shortcut">${escapeHtml(r.shortcut || "")}</div>
      <div class="quick-reply-row__text" title="${escapeAttr(r.text || "")}">
        ${escapeHtml(r.text || "—")}
      </div>
      <div class="quick-reply-row__actions">
        <button
          type="button"
          class="contact-row__action"
          data-resposta-action="editar"
          data-resposta-id="${escapeAttr(r.id)}"
          aria-label="Editar"
          title="Editar"
        >${Icons.edit}</button>
        <button
          type="button"
          class="contact-row__action contact-row__action--danger"
          data-resposta-action="deletar"
          data-resposta-id="${escapeAttr(r.id)}"
          aria-label="Deletar"
          title="Deletar"
        >${Icons.x}</button>
      </div>
    </article>
  `;
}

function RespostaRapidaFormModal({ open = false, editing = null } = {}) {
  const isEdit = Boolean(editing?.id);

  return `
    <div class="page-modal ${open ? "is-open" : ""}" id="resposta-rapida-modal" ${open ? "" : "hidden"}>
      <div class="page-modal__backdrop"></div>
      <div
        class="page-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resposta-rapida-form-title"
      >
        <button
          type="button"
          class="page-modal__close"
          data-resposta-modal-close
          aria-label="Fechar"
        >${Icons.x}</button>

        <h2 class="page-modal__title" id="resposta-rapida-form-title">
          ${isEdit ? "Editar resposta rápida" : "Nova resposta rápida"}
        </h2>

        <form class="contact-form" id="resposta-rapida-form" autocomplete="off">
          <input type="hidden" id="resposta-rapida-edit-id" value="${escapeAttr(editing?.id || "")}" />

          <label class="contact-field">
            <span class="contact-field__label">Atalho</span>
            <input
              type="text"
              id="resposta-rapida-shortcut"
              name="shortcut"
              placeholder="ola"
              value="${escapeAttr(editing?.shortcut || "")}"
              required
            />
          </label>

          <label class="contact-field">
            <span class="contact-field__label">Resposta rápida</span>
            <textarea
              id="resposta-rapida-text"
              name="text"
              rows="4"
              required
            >${escapeHtml(editing?.text || "")}</textarea>
          </label>

          <div class="contact-form__actions">
            <button type="button" class="contact-form__btn contact-form__btn--ghost" data-resposta-modal-close>
              Cancelar
            </button>
            <button type="submit" class="contact-form__btn contact-form__btn--primary">
              ${isEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}


