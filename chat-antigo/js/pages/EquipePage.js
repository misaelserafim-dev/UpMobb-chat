import { Icons } from "../icons.js";
import { PageBackButton } from "../components/PageBackButton.js";
import { AddButton } from "../ui/AddButton.js";
import { LetterAvatar } from "../utils/avatar.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";
import {
  EQUIPE_CONNECTIONS,
  EQUIPE_PERMISSIONS,
  EQUIPE_PROFILES,
  emptyEquipePermissions,
} from "../data/equipe.js";

export function EquipePage({
  equipes = [],
  departamentos = [],
  searchQuery = "",
  modalOpen = false,
  editing = null,
  passwordVisible = false,
  selectedDepartamentoIds = [],
} = {}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? equipes.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.profile || "").toLowerCase().includes(q)
      )
    : equipes;

  const list =
    filtered.length === 0
      ? `<p class="page-panel__empty">Nenhum membro da equipe encontrado.</p>`
      : `
        <div class="equipe-table__head" aria-hidden="true">
          <span class="equipe-table__col">Nome</span>
          <span class="equipe-table__col">E-mail</span>
          <span class="equipe-table__col">Perfil</span>
          <span class="equipe-table__col">Conexão</span>
          <span class="equipe-table__col equipe-table__col--actions">Ações</span>
        </div>
        ${filtered.map((m) => EquipeRow(m)).join("")}
      `;

  return `
    <main class="chat-window page-panel" id="equipe-page" aria-label="Equipe">
      <header class="chat-window__header">
        <div class="page-container">
          <div class="chat-window__identity">
            ${PageBackButton()}
            <div class="chat-window__meta">
              <div class="chat-window__name">Equipe</div>
              <div class="chat-window__assignee">
                ${filtered.length} membro${filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div class="contatos-header-actions">
            <label class="page-panel__search page-panel__search--header">
              ${Icons.search}
              <input
                type="search"
                id="equipe-search"
                class="page-panel__search-input"
                placeholder="Buscar equipe"
                aria-label="Buscar equipe"
                value="${escapeAttr(searchQuery)}"
              />
            </label>
            ${AddButton({
              id: "equipe-add-btn",
              label: "Adicionar membro",
            })}
          </div>
        </div>
      </header>

      <div class="page-panel__body">
        <div class="page-container page-container--contacts">
          <div class="page-panel__list equipe-table" id="equipe-list" role="list">
            ${list}
          </div>

          ${EquipeFormModal({
            open: modalOpen,
            editing,
            departamentos,
            passwordVisible,
            selectedDepartamentoIds,
          })}
        </div>
      </div>
    </main>
  `;
}

function connectionLabel(id) {
  return EQUIPE_CONNECTIONS.find((c) => c.id === id)?.label || id || "—";
}

function profileLabel(id) {
  return EQUIPE_PROFILES.find((p) => p.id === id)?.label || id || "—";
}

function EquipeRow(m) {
  return `
    <article class="equipe-row" data-equipe-id="${escapeAttr(m.id)}" role="listitem">
      <div class="equipe-row__name">
        ${LetterAvatar({ name: m.name, status: m.status || "offline" })}
        <span class="equipe-row__name-text">${escapeHtml(m.name)}</span>
      </div>
      <div class="equipe-row__email">${escapeHtml(m.email || "—")}</div>
      <div class="equipe-row__profile">${escapeHtml(profileLabel(m.profile))}</div>
      <div class="equipe-row__connection">${escapeHtml(connectionLabel(m.connectionId))}</div>
      <div class="equipe-row__actions">
        <button
          type="button"
          class="contact-row__action"
          data-equipe-action="editar"
          data-equipe-id="${escapeAttr(m.id)}"
          aria-label="Editar"
          title="Editar"
        >${Icons.edit}</button>
        <button
          type="button"
          class="contact-row__action contact-row__action--danger"
          data-equipe-action="deletar"
          data-equipe-id="${escapeAttr(m.id)}"
          aria-label="Deletar"
          title="Deletar"
        >${Icons.x}</button>
      </div>
    </article>
  `;
}

function permissionIcon(name) {
  return Icons[name] || Icons.users;
}

function EquipeFormModal({
  open = false,
  editing = null,
  departamentos = [],
  passwordVisible = false,
  selectedDepartamentoIds = [],
} = {}) {
  const isEdit = Boolean(editing?.id);
  const permissions = {
    ...emptyEquipePermissions(),
    ...(editing?.permissions || {}),
  };
  const pwdType = passwordVisible ? "text" : "password";

  return `
    <div class="page-modal ${open ? "is-open" : ""}" id="equipe-modal" ${open ? "" : "hidden"}>
      <div class="page-modal__backdrop"></div>
      <div
        class="page-modal__dialog page-modal__dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipe-form-title"
      >
        <button
          type="button"
          class="page-modal__close"
          data-equipe-modal-close
          aria-label="Fechar"
        >${Icons.x}</button>

        <h2 class="page-modal__title" id="equipe-form-title">
          ${isEdit ? "Editar membro" : "Novo membro da equipe"}
        </h2>

        <form class="equipe-form" id="equipe-form" autocomplete="off">
          <input type="hidden" id="equipe-edit-id" value="${escapeAttr(editing?.id || "")}" />

          <div class="equipe-form__layout">
            <div class="equipe-form__fields">
              <label class="contact-field">
                <span class="contact-field__label">Nome</span>
                <input
                  type="text"
                  id="equipe-name"
                  name="name"
                  value="${escapeAttr(editing?.name || "")}"
                  required
                />
              </label>

              <label class="contact-field">
                <span class="contact-field__label">Senha</span>
                <div class="password-field">
                  <input
                    type="${pwdType}"
                    id="equipe-password"
                    name="password"
                    value=""
                    ${isEdit ? "" : "required"}
                    placeholder="${isEdit ? "Deixe em branco para manter" : ""}"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="password-field__toggle"
                    id="equipe-password-toggle"
                    aria-label="${passwordVisible ? "Ocultar senha" : "Mostrar senha"}"
                    title="${passwordVisible ? "Ocultar senha" : "Mostrar senha"}"
                  >${passwordVisible ? Icons.eyeOff : Icons.eye}</button>
                </div>
              </label>

              <label class="contact-field">
                <span class="contact-field__label">E-mail</span>
                <input
                  type="email"
                  id="equipe-email"
                  name="email"
                  value="${escapeAttr(editing?.email || "")}"
                  required
                />
              </label>

              <label class="contact-field">
                <span class="contact-field__label">Conexão</span>
                <select id="equipe-connection" name="connection" required>
                  <option value="">Selecionar conexão</option>
                  ${EQUIPE_CONNECTIONS.map(
                    (c) => `
                    <option value="${escapeAttr(c.id)}" ${
                      editing?.connectionId === c.id ? "selected" : ""
                    }>${escapeHtml(c.label)}</option>`
                  ).join("")}
                </select>
              </label>

              <label class="contact-field">
                <span class="contact-field__label">Perfil</span>
                <select id="equipe-profile" name="profile" required>
                  ${EQUIPE_PROFILES.map((p) => {
                    const selected = (editing?.profile || "user") === p.id;
                    return `
                    <option value="${escapeAttr(p.id)}" ${
                      selected ? "selected" : ""
                    }>${escapeHtml(p.label)}</option>`;
                  }).join("")}
                </select>
              </label>

              <div class="contact-field">
                <span class="contact-field__label">Departamentos</span>
                ${DepartamentoSelect({
                  departamentos,
                  selectedDepartamentoIds,
                })}
              </div>
            </div>

            <aside class="equipe-form__permissions" aria-label="Permissões">
              <div class="equipe-permissions__label">Permissões</div>
              <div class="equipe-permissions__list">
                ${EQUIPE_PERMISSIONS.map((p) => {
                  const on = Boolean(permissions[p.id]);
                  return `
                  <label class="equipe-permission">
                    <span class="equipe-permission__icon" aria-hidden="true">${permissionIcon(p.icon)}</span>
                    <span class="equipe-permission__meta">
                      <span class="equipe-permission__title">${escapeHtml(p.title)}</span>
                      <span class="equipe-permission__desc">${escapeHtml(p.description)}</span>
                    </span>
                    <span class="equipe-switch">
                      <input
                        type="checkbox"
                        name="permission"
                        value="${escapeAttr(p.id)}"
                        ${on ? "checked" : ""}
                      />
                      <span class="equipe-switch__track" aria-hidden="true"></span>
                    </span>
                  </label>`;
                }).join("")}
              </div>
            </aside>
          </div>

          <div class="contact-form__actions">
            <button type="button" class="contact-form__btn contact-form__btn--ghost" data-equipe-modal-close>
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

function DepartamentoSelect({ departamentos = [], selectedDepartamentoIds = [] } = {}) {
  if (!departamentos.length) {
    return `<p class="contact-etiqueta-picker__empty">Nenhum departamento cadastrado.</p>`;
  }

  const selected = departamentos.filter((d) => selectedDepartamentoIds.includes(d.id));
  const valueHtml =
    selected.length === 0
      ? `<span class="etiqueta-select__placeholder">Selecionar departamentos</span>`
      : selected
          .map(
            (d) => `
          <span class="etiqueta-chip etiqueta-select__chip" style="--etiqueta-color: ${escapeAttr(d.color)}">
            <span class="etiqueta-chip__bar" aria-hidden="true"></span>
            <span class="etiqueta-chip__name">${escapeHtml(d.name)}</span>
          </span>`
          )
          .join("");

  return `
    <div class="etiqueta-select" id="equipe-dept-select">
      <button
        type="button"
        class="etiqueta-select__trigger"
        id="equipe-dept-select-btn"
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-controls="equipe-dept-select-menu"
      >
        <span class="etiqueta-select__value" id="equipe-dept-select-value">${valueHtml}</span>
        <span class="etiqueta-select__chevron" aria-hidden="true">${Icons.chevronDown}</span>
      </button>
      <div class="etiqueta-select__menu" id="equipe-dept-select-menu" hidden role="listbox" aria-multiselectable="true">
        <input
          type="search"
          class="etiqueta-select__search"
          id="equipe-dept-select-search"
          placeholder="Pesquisar departamento"
          aria-label="Pesquisar departamento"
        />
        <button
          type="button"
          class="etiqueta-select__clear"
          data-equipe-dept-clear
          ${selected.length === 0 ? "hidden" : ""}
        >
          Limpar seleção
        </button>
        <div class="etiqueta-select__list" id="equipe-dept-select-list">
          ${departamentos
            .map((d) => {
              const on = selectedDepartamentoIds.includes(d.id);
              return `
            <button
              type="button"
              class="etiqueta-select__option ${on ? "is-active" : ""}"
              data-equipe-dept="${escapeAttr(d.id)}"
              data-dept-name="${escapeAttr(d.name)}"
              data-dept-color="${escapeAttr(d.color)}"
              role="option"
              aria-selected="${on}"
            >
              <span class="etiqueta-select__check" aria-hidden="true"></span>
              <span class="etiqueta-chip" style="--etiqueta-color: ${escapeAttr(d.color)}">
                <span class="etiqueta-chip__bar" aria-hidden="true"></span>
                <span class="etiqueta-chip__name">${escapeHtml(d.name)}</span>
              </span>
            </button>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}


