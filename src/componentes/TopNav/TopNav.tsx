import { useEffect, useRef, useState } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { NavLink } from "@/componentes/NavLink/NavLink.tsx";
import { ThemePickerMenu } from "@/componentes/ThemePickerMenu/ThemePickerMenu.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import type { TopNavProps } from "./TopNav.ts";
import "./TopNav.css";
import "../NavLink/NavLink.css";
import "../ThemePickerMenu/ThemePickerMenu.css";

export function TopNav({
  active = "conversas",
  searchQuery = "",
  searchDisabled = false,
  themeId = "upmobb",
  onSearchChange,
  onNavigate,
  onThemeChange,
  onLogout,
}: TopNavProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  const anyMenuOpen = configOpen || themeOpen || menuOpen;

  useDismissable({
    open: anyMenuOpen,
    onDismiss: () => {
      setConfigOpen(false);
      setThemeOpen(false);
      setMenuOpen(false);
    },
    refs: [rootRef],
  });

  const configActive =
    active === "etiquetas" ||
    active === "departamentos" ||
    active === "respostas-rapidas" ||
    active === "equipe";

  const showSearch = active === "conversas";

  function closeMenus() {
    setConfigOpen(false);
    setThemeOpen(false);
    setMenuOpen(false);
  }

  function go(id: string) {
    closeMenus();
    onNavigate?.(id);
  }

  useEffect(() => {
    closeMenus();
  }, [active]);

  const configItems = (
    <>
      <button type="button" className={`nav-submenu__item${active === "etiquetas" ? " is-active" : ""}`} role="menuitem" onClick={() => go("etiquetas")}>
        <span className="nav-submenu__icon" aria-hidden="true"><Icons.Tag /></span>
        Etiqueta
      </button>
      <button type="button" className={`nav-submenu__item${active === "departamentos" ? " is-active" : ""}`} role="menuitem" onClick={() => go("departamentos")}>
        <span className="nav-submenu__icon" aria-hidden="true"><Icons.Building /></span>
        Departamento
      </button>
      <button type="button" className={`nav-submenu__item${active === "respostas-rapidas" ? " is-active" : ""}`} role="menuitem" onClick={() => go("respostas-rapidas")}>
        <span className="nav-submenu__icon" aria-hidden="true"><Icons.Zap /></span>
        Resposta rápida
      </button>
      <button type="button" className={`nav-submenu__item${active === "equipe" ? " is-active" : ""}`} role="menuitem" onClick={() => go("equipe")}>
        <span className="nav-submenu__icon" aria-hidden="true"><Icons.Team /></span>
        Equipe
      </button>
      <button type="button" className="nav-submenu__item nav-submenu__item--danger" role="menuitem" onClick={() => { closeMenus(); onLogout?.(); }}>
        <span className="nav-submenu__icon" aria-hidden="true"><Icons.LogOut /></span>
        Deslogar
      </button>
    </>
  );

  return (
    <header className="top-nav" aria-label="Menu principal" ref={rootRef}>
      {showSearch ? (
        <div className="chat-list__search top-nav__search">
          <Icons.Search />
          <input
            id="chat-search"
            type="search"
            placeholder="Buscar ou iniciar conversa"
            aria-label="Buscar"
            value={searchQuery}
            disabled={searchDisabled}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      ) : (
        <div className="top-nav__spacer" />
      )}

      <div className="top-nav__right">
        <nav className="top-nav__links top-nav__links--desktop" aria-label="Navegação">
          <NavLink id="conversas" label="Conversas" active={active === "conversas"} onClick={() => go("conversas")} />
          <NavLink id="contatos" label="Contatos" active={active === "contatos"} onClick={() => go("contatos")} />

          <div className={`nav-submenu${configOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className={`top-nav__link nav-submenu__trigger${configActive ? " top-nav__link--active" : ""}`}
              aria-haspopup="true"
              aria-expanded={configOpen}
              onClick={(e) => {
                e.stopPropagation();
                setConfigOpen((v) => !v);
                setThemeOpen(false);
              }}
            >
              Configurações
              <span className="nav-submenu__chevron" aria-hidden="true"><Icons.ChevronDown /></span>
            </button>
            {configOpen ? (
              <div className="nav-submenu__menu" role="menu">
                {configItems}
              </div>
            ) : null}
          </div>
        </nav>

        <div className={`nav-menu${menuOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="nav-menu__btn"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
              setThemeOpen(false);
              setConfigOpen(false);
            }}
          >
            {menuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
          {menuOpen ? (
            <div className="nav-menu__panel" role="menu">
              <nav className="top-nav__links top-nav__links--mobile">
                <NavLink id="conversas" label="Conversas" active={active === "conversas"} onClick={() => go("conversas")} />
                <NavLink id="contatos" label="Contatos" active={active === "contatos"} onClick={() => go("contatos")} />
                <div className="nav-submenu nav-submenu--mobile">
                  <button
                    type="button"
                    className={`top-nav__link nav-submenu__trigger${configActive ? " top-nav__link--active" : ""}`}
                    aria-expanded={configOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfigOpen((v) => !v);
                    }}
                  >
                    Configurações
                    <span className="nav-submenu__chevron" aria-hidden="true"><Icons.ChevronDown /></span>
                  </button>
                  {configOpen ? (
                    <div className="nav-submenu__menu nav-submenu__menu--inline" role="menu">
                      {configItems}
                    </div>
                  ) : null}
                </div>
              </nav>
            </div>
          ) : null}
        </div>

        <div className={`theme-picker${themeOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="theme-picker__btn"
            aria-label="Cores do sistema"
            aria-expanded={themeOpen}
            aria-haspopup="true"
            title="Cores do sistema"
            onClick={(e) => {
              e.stopPropagation();
              setThemeOpen((v) => !v);
              setConfigOpen(false);
              setMenuOpen(false);
            }}
          >
            <Icons.Palette />
          </button>
          <ThemePickerMenu
            open={themeOpen}
            themeId={themeId}
            onSelect={(id) => {
              onThemeChange?.(id);
              setThemeOpen(false);
            }}
          />
        </div>
      </div>
    </header>
  );
}
