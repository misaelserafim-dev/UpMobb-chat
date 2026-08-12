import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddButton } from "@/componentes/AddButton/AddButton.tsx";
import { ContatosSkeleton } from "@/componentes/ContatosSkeleton/ContatosSkeleton.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { PageBackButton } from "@/componentes/PageBackButton/PageBackButton.tsx";
import { TopNav } from "@/componentes/TopNav/TopNav.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { HomeTemplate } from "@/templates/Home/HomeTemplate.tsx";
import { fetchContacts, type Contact } from "@/services/contacts.ts";
import { applyTheme, getSavedThemeId } from "@/utils/theme.ts";
import "@/componentes/TopNav/TopNav.css";
import "@/componentes/AddButton/AddButton.css";
import "@/componentes/ChatWindow/ChatWindow.css";
import "./Contatos.css";

const PAGE_SIZE = 40;

export function Contatos() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [themeId, setThemeId] = useState(getSavedThemeId);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Upmobb | Contatos";
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      fetchContacts({ page, pageSize: PAGE_SIZE, query })
        .then((res) => {
          if (cancelled) return;
          setContacts(res.items);
          setTotal(res.total);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setContacts([]);
          setTotal(0);
          setLoading(false);
        });
    }, query ? 220 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, query]);

  function go(id: string) {
    if (id === "conversas") navigate("/");
    else if (id === "contatos") navigate("/contatos");
    else if (id === "componentes") navigate("/componentes");
    else navigate(`/${id}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <HomeTemplate>
      <TopNav
        active="contatos"
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
        <main className="chat-window page-panel" id="contatos-page" aria-label="Contatos">
          <header className="chat-window__header">
            <div className="page-container">
              <div className="chat-window__identity">
                <PageBackButton onClick={() => navigate("/")} />
                <div className="chat-window__meta">
                  <div className="chat-window__name">Contatos</div>
                  <div className="chat-window__assignee">
                    {loading ? "…" : `${total} contato${total === 1 ? "" : "s"}`}
                  </div>
                </div>
              </div>

              <div className="contatos-header-actions">
                <label className="page-panel__search page-panel__search--header">
                  <Icons.Search />
                  <input
                    type="search"
                    id="contatos-search"
                    className="page-panel__search-input"
                    placeholder="Buscar contato"
                    aria-label="Buscar contato"
                    value={query}
                    onChange={(e) => {
                      setPage(1);
                      setQuery(e.target.value);
                    }}
                  />
                </label>
                <AddButton id="contatos-add-btn" label="Adicionar contato" />
              </div>
            </div>
          </header>

          <div className="page-panel__body">
            <div className="page-container page-container--contacts">
              <div
                className="page-panel__list contact-table"
                id="contatos-list"
                role="list"
                aria-busy={loading || undefined}
                aria-label={loading ? "Carregando contatos" : undefined}
              >
                {loading ? (
                  <ContatosSkeleton count={8} />
                ) : contacts.length === 0 ? (
                  <p className="page-panel__empty">Nenhum contato encontrado.</p>
                ) : (
                  <>
                    <div className="contact-table__head" aria-hidden="true">
                      <span className="contact-table__col contact-table__col--person">Contato</span>
                      <span className="contact-table__col contact-table__col--label">Etiquetas</span>
                      <span className="contact-table__col contact-table__col--actions">Ações</span>
                    </div>
                    {contacts.map((c) => (
                      <article key={c.id} className="contact-row" data-contact-id={c.id} role="listitem">
                        <div className="contact-row__person">
                          <img className="contact-row__avatar" src={c.avatar} alt="" />
                          <div className="contact-row__meta">
                            <div className="contact-row__name">{c.name}</div>
                            <div className="contact-row__phone">{c.phone}</div>
                          </div>
                        </div>

                        <div className="contact-row__etiqueta">
                          {c.tags?.length ? (
                            <div className="contact-etiqueta-list">
                              {c.tags.map((t) => (
                                <span
                                  key={t.id}
                                  className="etiqueta-chip contact-row__chip"
                                  style={{ ["--etiqueta-color" as string]: t.color || "#9ca3af" }}
                                >
                                  <span className="etiqueta-chip__bar" aria-hidden="true" />
                                  <span className="etiqueta-chip__name">{t.label}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="contact-etiqueta contact-etiqueta--empty">—</span>
                          )}
                        </div>

                        <div className="contact-row__actions">
                          <button
                            type="button"
                            className="contact-row__action"
                            data-contact-action="whatsapp"
                            aria-label="WhatsApp"
                            title="WhatsApp"
                          >
                            <Icons.Whatsapp />
                          </button>
                          <button
                            type="button"
                            className="contact-row__action"
                            data-contact-action="editar"
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            type="button"
                            className="contact-row__action contact-row__action--danger"
                            data-contact-action="deletar"
                            aria-label="Deletar"
                            title="Deletar"
                          >
                            <Icons.X />
                          </button>
                        </div>
                      </article>
                    ))}
                  </>
                )}
              </div>

              {!loading && total > PAGE_SIZE ? (
                <div className="contatos-pagination">
                  <button
                    type="button"
                    className="contatos-pagination__btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <span className="contatos-pagination__info">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    className="contatos-pagination__btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </HomeTemplate>
  );
}
