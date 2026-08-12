import { Icons } from "../icons.js";
import { DIAL_CODES, getDialCode } from "../data/dialCodes.js";
import { PageBackButton } from "../components/PageBackButton.js";
import { AddButton } from "../ui/AddButton.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

export function ContatosPage({
  contacts = [],
  searchQuery = "",
  modalOpen = false,
  dialCode = "+55",
  dialSearch = "",
  etiquetas = [],
  selectedEtiquetaIds = [],
} = {}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.etiqueta || "").toLowerCase().includes(q) ||
          (c.tags || []).some((t) => (t.label || "").toLowerCase().includes(q))
      )
    : contacts;

  const list =
    filtered.length === 0
      ? `<p class="page-panel__empty">Nenhum contato encontrado.</p>`
      : `
        <div class="contact-table__head" aria-hidden="true">
          <span class="contact-table__col contact-table__col--person">Contato</span>
          <span class="contact-table__col contact-table__col--label">Etiquetas</span>
          <span class="contact-table__col contact-table__col--actions">Ações</span>
        </div>
        ${filtered.map((c) => ContactRow(c)).join("")}
      `;

  return `
    <main class="chat-window page-panel" id="contatos-page" aria-label="Contatos">
      <header class="chat-window__header">
        <div class="page-container">
          <div class="chat-window__identity">
            ${PageBackButton()}
            <div class="chat-window__meta">
              <div class="chat-window__name">Contatos</div>
              <div class="chat-window__assignee">
                ${filtered.length} contato${filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div class="contatos-header-actions">
            <label class="page-panel__search page-panel__search--header">
              ${Icons.search}
              <input
                type="search"
                id="contatos-search"
                class="page-panel__search-input"
                placeholder="Buscar contato"
                aria-label="Buscar contato"
                value="${escapeAttr(searchQuery)}"
              />
            </label>
            ${AddButton({
              id: "contatos-add-btn",
              label: "Adicionar contato",
            })}
          </div>
        </div>
      </header>

      <div class="page-panel__body">
        <div class="page-container page-container--contacts">
          <div class="page-panel__list contact-table" id="contatos-list" role="list">
            ${list}
          </div>

          ${ContactAddModal({
            open: modalOpen,
            dialCode,
            dialSearch,
            etiquetas,
            selectedEtiquetaIds,
          })}
        </div>
      </div>
    </main>
  `;
}

function ContactAddModal({
  open = false,
  dialCode = "+55",
  dialSearch = "",
  etiquetas = [],
  selectedEtiquetaIds = [],
} = {}) {
  const selected = getDialCode(dialCode);
  const sq = dialSearch.trim().toLowerCase();
  const codes = sq
    ? DIAL_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(sq) ||
          c.dial.includes(sq) ||
          c.iso.toLowerCase().includes(sq)
      )
    : DIAL_CODES;

  return `
    <div class="page-modal ${open ? "is-open" : ""}" id="contact-add-modal" ${open ? "" : "hidden"}>
      <div class="page-modal__backdrop"></div>
      <div
        class="page-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-add-title"
      >
        <button
          type="button"
          class="page-modal__close"
          data-contact-modal-close
          aria-label="Fechar"
        >${Icons.x}</button>

        <h2 class="page-modal__title" id="contact-add-title">Novo contato</h2>

        <form class="contact-form" id="contact-add-form" autocomplete="off">
          <label class="contact-field">
            <span class="contact-field__label">Nome</span>
            <input type="text" id="contact-add-name" name="name" required />
          </label>

          <div class="contact-field">
            <span class="contact-field__label">Telefone</span>
            <div class="phone-field">
              <div class="phone-ddi" id="phone-ddi">
                <button
                  type="button"
                  class="phone-ddi__trigger"
                  id="phone-ddi-btn"
                  aria-haspopup="listbox"
                  aria-expanded="false"
                  aria-controls="phone-ddi-menu"
                >
                  <span class="phone-ddi__flag">${selected.flag}</span>
                  <span class="phone-ddi__chevron" aria-hidden="true">${Icons.chevronDown}</span>
                  <span class="phone-ddi__code">${escapeHtml(selected.dial)}</span>
                </button>
                <div class="phone-ddi__menu" id="phone-ddi-menu" hidden role="listbox">
                  <input
                    type="search"
                    class="phone-ddi__search"
                    id="phone-ddi-search"
                    placeholder="search"
                    aria-label="Buscar país"
                    value="${escapeAttr(dialSearch)}"
                  />
                  <div class="phone-ddi__list" id="phone-ddi-list">
                    ${codes
                      .map(
                        (c) => `
                      <button
                        type="button"
                        class="phone-ddi__option ${c.dial === selected.dial && c.iso === selected.iso ? "is-active" : ""}"
                        data-dial="${escapeAttr(c.dial)}"
                        data-iso="${escapeAttr(c.iso)}"
                        role="option"
                        aria-selected="${c.dial === selected.dial && c.iso === selected.iso}"
                      >
                        <span class="phone-ddi__flag">${c.flag}</span>
                        <span class="phone-ddi__name">${escapeHtml(c.name)}</span>
                        <span class="phone-ddi__dial">${escapeHtml(c.dial)}</span>
                      </button>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
              <input
                type="tel"
                id="contact-add-phone"
                name="phone"
                class="phone-field__number"
                placeholder="${escapeAttr(
                  selected.dial === "+55" ? "(11) 99999-9999" : "Número"
                )}"
                inputmode="numeric"
                autocomplete="tel-national"
                required
              />
            </div>
          </div>

          <label class="contact-field">
            <span class="contact-field__label">E-mail</span>
            <input type="email" id="contact-add-email" name="email" />
          </label>

          <div class="contact-field">
            <span class="contact-field__label">Etiquetas</span>
            ${EtiquetaSelect({ etiquetas, selectedEtiquetaIds })}
          </div>

          <label class="contact-field">
            <span class="contact-field__label">Observação</span>
            <textarea id="contact-add-notes" name="notes" rows="3"></textarea>
          </label>

          <div class="contact-form__actions">
            <button type="button" class="contact-form__btn contact-form__btn--ghost" data-contact-modal-close>
              Cancelar
            </button>
            <button type="submit" class="contact-form__btn contact-form__btn--primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function EtiquetaSelect({ etiquetas = [], selectedEtiquetaIds = [] } = {}) {
  if (!etiquetas.length) {
    return `<p class="contact-etiqueta-picker__empty">Nenhuma etiqueta cadastrada.</p>`;
  }

  const selected = etiquetas.filter((et) => selectedEtiquetaIds.includes(et.id));
  const valueHtml =
    selected.length === 0
      ? `<span class="etiqueta-select__placeholder">Selecionar etiquetas</span>`
      : selected
          .map(
            (et) => `
          <span class="etiqueta-chip etiqueta-select__chip" style="--etiqueta-color: ${escapeAttr(et.color)}">
            <span class="etiqueta-chip__bar" aria-hidden="true"></span>
            <span class="etiqueta-chip__name">${escapeHtml(et.name)}</span>
          </span>`
          )
          .join("");

  return `
    <div class="etiqueta-select" id="etiqueta-select">
      <button
        type="button"
        class="etiqueta-select__trigger"
        id="etiqueta-select-btn"
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-controls="etiqueta-select-menu"
      >
        <span class="etiqueta-select__value" id="etiqueta-select-value">${valueHtml}</span>
        <span class="etiqueta-select__chevron" aria-hidden="true">${Icons.chevronDown}</span>
      </button>
      <div class="etiqueta-select__menu" id="etiqueta-select-menu" hidden role="listbox" aria-multiselectable="true">
        <input
          type="search"
          class="etiqueta-select__search"
          id="etiqueta-select-search"
          placeholder="Pesquisar etiqueta"
          aria-label="Pesquisar etiqueta"
        />
        <button
          type="button"
          class="etiqueta-select__clear"
          data-contact-etiqueta-clear
          ${selected.length === 0 ? "hidden" : ""}
        >
          Limpar seleção
        </button>
        <div class="etiqueta-select__list" id="etiqueta-select-list">
          ${etiquetas
            .map((et) => {
              const on = selectedEtiquetaIds.includes(et.id);
              return `
            <button
              type="button"
              class="etiqueta-select__option ${on ? "is-active" : ""}"
              data-contact-etiqueta="${escapeAttr(et.id)}"
              data-etiqueta-name="${escapeAttr(et.name)}"
              data-etiqueta-color="${escapeAttr(et.color)}"
              role="option"
              aria-selected="${on}"
            >
              <span class="etiqueta-select__check" aria-hidden="true"></span>
              <span class="etiqueta-chip" style="--etiqueta-color: ${escapeAttr(et.color)}">
                <span class="etiqueta-chip__bar" aria-hidden="true"></span>
                <span class="etiqueta-chip__name">${escapeHtml(et.name)}</span>
              </span>
            </button>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function ContactRow(c) {
  const tags = c.tags?.length ? c.tags : c.tag ? [c.tag] : [];

  return `
    <article class="contact-row" data-contact-id="${escapeAttr(c.id)}" role="listitem">
      <div class="contact-row__person">
        <img class="contact-row__avatar" src="${escapeAttr(c.avatar)}" alt="" />
        <div class="contact-row__meta">
          <div class="contact-row__name">${escapeHtml(c.name)}</div>
          <div class="contact-row__phone">${escapeHtml(c.phone || "")}</div>
        </div>
      </div>

      <div class="contact-row__etiqueta">
        ${
          tags.length
            ? `<div class="contact-etiqueta-list">${tags
                .map(
                  (t) => `
              <span class="etiqueta-chip contact-row__chip" style="--etiqueta-color: ${escapeAttr(
                t.color || "#9ca3af"
              )}">
                <span class="etiqueta-chip__bar" aria-hidden="true"></span>
                <span class="etiqueta-chip__name">${escapeHtml(t.label || "")}</span>
              </span>`
                )
                .join("")}</div>`
            : `<span class="contact-etiqueta contact-etiqueta--empty">—</span>`
        }
      </div>

      <div class="contact-row__actions">
        <button
          type="button"
          class="contact-row__action"
          data-contact-action="whatsapp"
          data-contact-id="${escapeAttr(c.id)}"
          aria-label="WhatsApp"
          title="WhatsApp"
        >${Icons.whatsapp}</button>
        <button
          type="button"
          class="contact-row__action"
          data-contact-action="editar"
          data-contact-id="${escapeAttr(c.id)}"
          aria-label="Editar"
          title="Editar"
        >${Icons.edit}</button>
        <button
          type="button"
          class="contact-row__action contact-row__action--danger"
          data-contact-action="deletar"
          data-contact-id="${escapeAttr(c.id)}"
          aria-label="Deletar"
          title="Deletar"
        >${Icons.x}</button>
      </div>
    </article>
  `;
}


