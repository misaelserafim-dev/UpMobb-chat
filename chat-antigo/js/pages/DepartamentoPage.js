import { Icons } from "../icons.js";
import { PageBackButton } from "../components/PageBackButton.js";
import { AddButton } from "../ui/AddButton.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function DepartamentoPage({
  departamentos = [],
  searchQuery = "",
  modalOpen = false,
  editing = null,
} = {}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? departamentos.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.greeting || "").toLowerCase().includes(q)
      )
    : departamentos;

  const list =
    filtered.length === 0
      ? `<p class="page-panel__empty">Nenhum departamento encontrado.</p>`
      : `
        <div class="dept-table__head" aria-hidden="true">
          <span class="dept-table__col dept-table__col--name">Nome</span>
          <span class="dept-table__col dept-table__col--color">Cor</span>
          <span class="dept-table__col dept-table__col--greeting">Mensagem de saudação</span>
          <span class="dept-table__col dept-table__col--actions">Ações</span>
        </div>
        ${filtered.map((d) => DepartamentoRow(d)).join("")}
      `;

  return `
    <main class="chat-window page-panel" id="departamento-page" aria-label="Departamento">
      <header class="chat-window__header">
        <div class="page-container">
          <div class="chat-window__identity">
            ${PageBackButton()}
            <div class="chat-window__meta">
              <div class="chat-window__name">Departamento</div>
              <div class="chat-window__assignee">
                ${filtered.length} departamento${filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div class="contatos-header-actions">
            <label class="page-panel__search page-panel__search--header">
              ${Icons.search}
              <input
                type="search"
                id="departamento-search"
                class="page-panel__search-input"
                placeholder="Buscar departamento"
                aria-label="Buscar departamento"
                value="${escapeAttr(searchQuery)}"
              />
            </label>
            ${AddButton({
              id: "departamento-add-btn",
              label: "Adicionar departamento",
            })}
          </div>
        </div>
      </header>

      <div class="page-panel__body">
        <div class="page-container page-container--contacts">
          <div class="page-panel__list dept-table" id="departamento-list" role="list">
            ${list}
          </div>

          ${DepartamentoFormModal({ open: modalOpen, editing })}
        </div>
      </div>
    </main>
  `;
}

function DepartamentoRow(d) {
  return `
    <article class="dept-row" data-departamento-id="${escapeAttr(d.id)}" role="listitem">
      <div class="dept-row__name">${escapeHtml(d.name)}</div>
      <div class="dept-row__color">
        <span class="dept-swatch" style="--dept-color: ${escapeAttr(d.color)}" title="${escapeAttr(d.color)}"></span>
      </div>
      <div class="dept-row__greeting" title="${escapeAttr(d.greeting || "")}">
        ${escapeHtml(d.greeting || "—")}
      </div>
      <div class="dept-row__actions">
        <button
          type="button"
          class="contact-row__action"
          data-departamento-action="editar"
          data-departamento-id="${escapeAttr(d.id)}"
          aria-label="Editar"
          title="Editar"
        >${Icons.edit}</button>
        <button
          type="button"
          class="contact-row__action contact-row__action--danger"
          data-departamento-action="deletar"
          data-departamento-id="${escapeAttr(d.id)}"
          aria-label="Deletar"
          title="Deletar"
        >${Icons.x}</button>
      </div>
    </article>
  `;
}

function DepartamentoFormModal({ open = false, editing = null } = {}) {
  const isEdit = Boolean(editing?.id);
  const colorSet = isEdit;
  const color = editing?.color || "#ffffff";

  return `
    <div class="page-modal ${open ? "is-open" : ""}" id="departamento-modal" ${open ? "" : "hidden"}>
      <div class="page-modal__backdrop"></div>
      <div
        class="page-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="departamento-form-title"
      >
        <button
          type="button"
          class="page-modal__close"
          data-departamento-modal-close
          aria-label="Fechar"
        >${Icons.x}</button>

        <h2 class="page-modal__title" id="departamento-form-title">
          ${isEdit ? "Editar departamento" : "Novo departamento"}
        </h2>

        <form class="contact-form" id="departamento-form" autocomplete="off">
          <input type="hidden" id="departamento-edit-id" value="${escapeAttr(editing?.id || "")}" />

          <div class="contact-field departamento-name-row">
            <span class="contact-field__label">Nome</span>
            <div class="departamento-name-row__fields">
              <input
                type="text"
                id="departamento-name"
                name="name"
                value="${escapeAttr(editing?.name || "")}"
                required
              />
              <label
                class="etiqueta-form__color departamento-color ${colorSet ? "" : "is-empty"}"
                title="Cor do departamento"
                id="departamento-color-wrap"
              >
                <input
                  type="color"
                  id="departamento-color"
                  value="${escapeAttr(color)}"
                  aria-label="Cor do departamento"
                  data-color-set="${colorSet ? "true" : "false"}"
                />
              </label>
            </div>
          </div>

          <label class="contact-field">
            <span class="contact-field__label">Mensagem de saudação</span>
            <textarea
              id="departamento-greeting"
              name="greeting"
              rows="4"
              required
            >${escapeHtml(editing?.greeting || "")}</textarea>
          </label>

          <div class="contact-form__actions">
            <button type="button" class="contact-form__btn contact-form__btn--ghost" data-departamento-modal-close>
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


