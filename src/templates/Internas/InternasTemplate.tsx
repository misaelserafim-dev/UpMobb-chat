import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddButton } from "@/componentes/AddButton/AddButton.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { PageBackButton } from "@/componentes/PageBackButton/PageBackButton.tsx";
import { TopNav } from "@/componentes/TopNav/TopNav.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { HomeTemplate } from "@/templates/Home/HomeTemplate.tsx";
import { applyTheme, getSavedThemeId } from "@/utils/theme.ts";
import type { InternasTemplateProps } from "./InternasTemplate.ts";
import "@/componentes/TopNav/TopNav.css";
import "@/componentes/AddButton/AddButton.css";
import "@/componentes/ChatWindow/ChatWindow.css";
import "./InternasTemplate.css";

export function InternasTemplate({
  active,
  title,
  countLabel,
  pageId,
  ariaLabel,
  searchPlaceholder = "Buscar",
  searchValue = "",
  searchAriaLabel,
  onSearchChange,
  addId,
  addLabel = "Adicionar",
  onAdd,
  children,
}: InternasTemplateProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [themeId, setThemeId] = useState(getSavedThemeId);

  useEffect(() => {
    document.title = `Upmobb | ${title}`;
    applyTheme(themeId);
  }, [themeId, title]);

  function go(id: string) {
    if (id === "conversas") navigate("/");
    else if (id === "contatos") navigate("/contatos");
    else if (id === "componentes") navigate("/componentes");
    else navigate(`/${id}`);
  }

  return (
    <HomeTemplate>
      <TopNav
        active={active}
        themeId={themeId}
        onNavigate={go}
        onThemeChange={(id) => {
          setThemeId(id);
          applyTheme(id);
        }}
        onLogout={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />

      <div className="workspace" id="workspace">
        <main className="chat-window page-panel" id={pageId} aria-label={ariaLabel || title}>
          <header className="chat-window__header">
            <div className="page-container">
              <div className="chat-window__identity">
                <PageBackButton onClick={() => navigate("/")} />
                <div className="chat-window__meta">
                  <div className="chat-window__name">{title}</div>
                  {countLabel ? <div className="chat-window__assignee">{countLabel}</div> : null}
                </div>
              </div>

              <div className="internas-header-actions contatos-header-actions">
                {onSearchChange ? (
                  <label className="page-panel__search page-panel__search--header">
                    <Icons.Search />
                    <input
                      type="search"
                      className="page-panel__search-input"
                      placeholder={searchPlaceholder}
                      aria-label={searchAriaLabel || searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </label>
                ) : null}
                {onAdd ? <AddButton id={addId} label={addLabel} onClick={onAdd} /> : null}
              </div>
            </div>
          </header>

          <div className="page-panel__body">
            <div className="page-container page-container--contacts">{children}</div>
          </div>
        </main>
      </div>
    </HomeTemplate>
  );
}
