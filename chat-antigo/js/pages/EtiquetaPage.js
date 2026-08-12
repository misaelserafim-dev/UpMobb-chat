import { Icons } from "../icons.js";
import { PageBackButton } from "../components/PageBackButton.js";
import { AddButton } from "../ui/AddButton.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function EtiquetaPage({
  etiquetas = [],
  searchQuery = "",
  modalOpen = false,
  editing = null,
} = {}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? etiquetas.filter((e) => e.name.toLowerCase().includes(q))
    : etiquetas;

  const list =
    filtered.length === 0
      ? `<p class="page-panel__empty">Nenhuma etiqueta encontrada.</p>`
      : `<div class="etiqueta-grid" id="etiqueta-grid">${filtered
          .map((e) => EtiquetaCard(e))
          .join("")}</div>`;

  return `
    <main class="chat-window page-panel" id="etiqueta-page" aria-label="Etiqueta">
      <header class="chat-window__header">
        <div class="page-container">
          <div class="chat-window__identity">
            ${PageBackButton()}
            <div class="chat-window__meta">
              <div class="chat-window__name">Etiqueta</div>
              <div class="chat-window__assignee">
                ${filtered.length} etiqueta${filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div class="contatos-header-actions">
            <label class="page-panel__search page-panel__search--header">
              ${Icons.search}
              <input
                type="search"
                id="etiqueta-search"
                class="page-panel__search-input"
                placeholder="Buscar etiqueta"
                aria-label="Buscar etiqueta"
                value="${escapeAttr(searchQuery)}"
              />
            </label>
            ${AddButton({
              id: "etiqueta-add-btn",
              label: "Adicionar etiqueta",
            })}
          </div>
        </div>
      </header>

      <div class="page-panel__body">
        <div class="page-container page-container--contacts">
          ${list}

          ${EtiquetaFormModal({ open: modalOpen, editing })}
        </div>
      </div>
    </main>
  `;
}

function EtiquetaCard(e) {
  return `
    <article class="etiqueta-card" data-etiqueta-id="${escapeAttr(e.id)}">
      <span class="etiqueta-chip" style="--etiqueta-color: ${escapeAttr(e.color)}">
        <span class="etiqueta-chip__bar" aria-hidden="true"></span>
        <span class="etiqueta-chip__name">${escapeHtml(e.name)}</span>
      </span>
      <div class="etiqueta-card__actions">
        <button
          type="button"
          class="etiqueta-card__action"
          data-etiqueta-action="editar"
          data-etiqueta-id="${escapeAttr(e.id)}"
          aria-label="Editar"
          title="Editar"
        >${Icons.edit}</button>
        <button
          type="button"
          class="etiqueta-card__action etiqueta-card__action--danger"
          data-etiqueta-action="deletar"
          data-etiqueta-id="${escapeAttr(e.id)}"
          aria-label="Remover"
          title="Remover"
        >${Icons.x}</button>
      </div>
    </article>
  `;
}

function EtiquetaFormModal({ open = false, editing = null } = {}) {
  const isEdit = Boolean(editing?.id);
  const colorSet = isEdit;
  const color = editing?.color || "#ffffff";

  return `
    <div class="page-modal ${open ? "is-open" : ""}" id="etiqueta-modal" ${open ? "" : "hidden"}>
      <div class="page-modal__backdrop"></div>
      <div
        class="page-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="etiqueta-form-title"
      >
        <button
          type="button"
          class="page-modal__close"
          data-etiqueta-modal-close
          aria-label="Fechar"
        >${Icons.x}</button>

        <h2 class="page-modal__title" id="etiqueta-form-title">
          ${isEdit ? "Editar etiqueta" : "Nova etiqueta"}
        </h2>

        <form class="contact-form" id="etiqueta-form" autocomplete="off">
          <input type="hidden" id="etiqueta-edit-id" value="${escapeAttr(editing?.id || "")}" />

          <div class="contact-field departamento-name-row">
            <span class="contact-field__label">Nome</span>
            <div class="departamento-name-row__fields">
              <input
                type="text"
                id="etiqueta-name"
                name="name"
                value="${escapeAttr(editing?.name || "")}"
                required
              />
              <label
                class="etiqueta-form__color departamento-color ${colorSet ? "" : "is-empty"}"
                title="Cor da etiqueta"
                id="etiqueta-color-wrap"
              >
                <input
                  type="color"
                  id="etiqueta-color"
                  value="${escapeAttr(color)}"
                  aria-label="Cor da etiqueta"
                  data-color-set="${colorSet ? "true" : "false"}"
                />
              </label>
            </div>
          </div>

          <div class="contact-form__actions">
            <button type="button" class="contact-form__btn contact-form__btn--ghost" data-etiqueta-modal-close>
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


