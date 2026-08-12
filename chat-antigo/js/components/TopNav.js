import { Icons } from "../icons.js";
import { SYSTEM_COLORS, getSavedThemeId } from "../theme.js";
import { NavLink } from "../ui/NavLink.js";
import { ThemePickerMenu } from "../ui/index.js";
import { escapeAttr } from "../utils/escape.js";

export function TopNav({
  active = "conversas",
  themeId = getSavedThemeId(),
  searchQuery = "",
  searchDisabled = false,
} = {}) {
  const configActive =
    active === "etiquetas" ||
    active === "departamentos" ||
    active === "respostas-rapidas" ||
    active === "equipe";
  const showSearch = active === "conversas";

  const configItems = `
    <button
      type="button"
      class="nav-submenu__item ${active === "etiquetas" ? "is-active" : ""}"
      data-nav="etiquetas"
      role="menuitem"
    ><span class="nav-submenu__icon" aria-hidden="true">${Icons.tag}</span>Etiqueta</button>
    <button
      type="button"
      class="nav-submenu__item ${active === "departamentos" ? "is-active" : ""}"
      data-nav="departamentos"
      role="menuitem"
    ><span class="nav-submenu__icon" aria-hidden="true">${Icons.building}</span>Departamento</button>
    <button
      type="button"
      class="nav-submenu__item ${active === "respostas-rapidas" ? "is-active" : ""}"
      data-nav="respostas-rapidas"
      role="menuitem"
    ><span class="nav-submenu__icon" aria-hidden="true">${Icons.zap}</span>Resposta rápida</button>
    <button
      type="button"
      class="nav-submenu__item ${active === "equipe" ? "is-active" : ""}"
      data-nav="equipe"
      role="menuitem"
    ><span class="nav-submenu__icon" aria-hidden="true">${Icons.team}</span>Equipe</button>
    <button
      type="button"
      class="nav-submenu__item nav-submenu__item--danger"
      data-logout
      role="menuitem"
    ><span class="nav-submenu__icon" aria-hidden="true">${Icons.logOut}</span>Deslogar</button>
  `;

  const configSubmenu = `
    <div class="nav-submenu" id="nav-submenu-config">
      <button
        type="button"
        class="top-nav__link nav-submenu__trigger ${configActive ? "top-nav__link--active" : ""}"
        data-submenu-toggle="config"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="nav-submenu-config-menu"
      >
        Configurações
        <span class="nav-submenu__chevron" aria-hidden="true">${Icons.chevronDown}</span>
      </button>
      <div
        class="nav-submenu__menu"
        id="nav-submenu-config-menu"
        hidden
        role="menu"
      >
        ${configItems}
      </div>
    </div>
  `;

  const desktopLinks = `
    ${NavLink({ id: "conversas", label: "Conversas", active: active === "conversas" })}
    ${NavLink({ id: "contatos", label: "Contatos", active: active === "contatos" })}
    ${configSubmenu}
  `;

  const mobileLinks = `
    ${NavLink({ id: "conversas", label: "Conversas", active: active === "conversas" })}
    ${NavLink({ id: "contatos", label: "Contatos", active: active === "contatos" })}
    <div class="nav-submenu nav-submenu--mobile">
      <button
        type="button"
        class="top-nav__link nav-submenu__trigger ${configActive ? "top-nav__link--active" : ""}"
        data-submenu-toggle="config-mobile"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="nav-submenu-config-menu-mobile"
      >
        Configurações
        <span class="nav-submenu__chevron" aria-hidden="true">${Icons.chevronDown}</span>
      </button>
      <div
        class="nav-submenu__menu nav-submenu__menu--inline"
        id="nav-submenu-config-menu-mobile"
        hidden
        role="menu"
      >
        ${configItems}
      </div>
    </div>
  `;

  return `
    <header class="top-nav" aria-label="Menu principal">
      ${
        showSearch
          ? `
      <div class="chat-list__search top-nav__search">
        ${Icons.search}
        <input
          id="chat-search"
          type="search"
          placeholder="Buscar ou iniciar conversa"
          aria-label="Buscar"
          value="${escapeAttr(searchQuery)}"
          ${searchDisabled ? "disabled" : ""}
        />
      </div>
      `
          : `<div class="top-nav__spacer"></div>`
      }

      <div class="top-nav__right">
        <nav class="top-nav__links top-nav__links--desktop" id="top-nav-desktop" aria-label="Navegação">
          ${desktopLinks}
        </nav>

        <div class="nav-menu" id="nav-menu">
          <button
            type="button"
            class="nav-menu__btn"
            id="nav-menu-btn"
            aria-label="Abrir menu"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="nav-menu-panel"
          >
            ${Icons.menu}
          </button>
          <div class="nav-menu__panel" id="nav-menu-panel" hidden role="menu">
            <nav class="top-nav__links top-nav__links--mobile">
              ${mobileLinks}
            </nav>
          </div>
        </div>

        <div class="theme-picker" id="theme-picker">
          <button
            type="button"
            class="theme-picker__btn"
            id="theme-picker-btn"
            aria-label="Cores do sistema"
            aria-haspopup="true"
            aria-expanded="false"
            title="Cores do sistema"
          >
            ${Icons.palette}
          </button>

          ${ThemePickerMenu({ themeId, colors: SYSTEM_COLORS, hidden: true })}
        </div>
      </div>
    </header>
  `;
}

