import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AddButton } from "@/componentes/AddButton/AddButton.tsx";
import { ChatEmpty } from "@/componentes/ChatEmpty/ChatEmpty.tsx";
import { ChatInput } from "@/componentes/ChatInput/ChatInput.tsx";
import { ChatItem } from "@/componentes/ChatItem/ChatItem.tsx";
import { ChatListSkeleton } from "@/componentes/ChatListSkeleton/ChatListSkeleton.tsx";
import { ChatMoreMenu } from "@/componentes/ChatMoreMenu/ChatMoreMenu.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { DocumentPreview } from "@/componentes/DocumentPreview/DocumentPreview.tsx";
import { FilterChip } from "@/componentes/FilterChip/FilterChip.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { Lightbox } from "@/componentes/Lightbox/Lightbox.tsx";
import { MenuItem } from "@/componentes/MenuItem/MenuItem.tsx";
import { MessageBubble } from "@/componentes/MessageBubble/MessageBubble.tsx";
import { MessageMenu } from "@/componentes/MessageMenu/MessageMenu.tsx";
import { NavLink } from "@/componentes/NavLink/NavLink.tsx";
import { PageBackButton } from "@/componentes/PageBackButton/PageBackButton.tsx";
import { ThemePickerMenu } from "@/componentes/ThemePickerMenu/ThemePickerMenu.tsx";
import { TopNav } from "@/componentes/TopNav/TopNav.tsx";
import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";
import { applyTheme, getSavedThemeId } from "@/utils/theme.ts";
import { DEMO_CHATS, DEMO_DOC, DEMO_MESSAGES } from "./Componentes.ts";
import { SystemMapView } from "./SystemMapView.tsx";
import "./Componentes.css";
import "@/componentes/ChatInput/ChatInput.css";
import "@/componentes/MessageBubble/MessageBubble.css";
import "@/componentes/ChatMoreMenu/ChatMoreMenu.css";
import "@/componentes/ThemePickerMenu/ThemePickerMenu.css";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "@/componentes/ChatItem/ChatItem.css";
import "@/componentes/TopNav/TopNav.css";
import "@/componentes/Lightbox/Lightbox.css";
import "@/componentes/DocumentPreview/DocumentPreview.css";
import "@/componentes/MessageMenu/MessageMenu.css";
import "@/componentes/ConfirmModal/ConfirmModal.css";
import "@/componentes/ChatEmpty/ChatEmpty.css";
import "@/componentes/FilterChip/FilterChip.css";
import "@/componentes/NavLink/NavLink.css";

const DEMO_PDF: DocumentPreviewFile = {
  name: "Q3_Campaign_Proposal_v2.pdf",
  size: "2.4 MB",
  pages: "4 pages",
  type: "pdf",
  url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
};

function Section({
  title,
  desc,
  children,
  demoClassName = "",
}: {
  title: string;
  desc: string;
  children: ReactNode;
  demoClassName?: string;
}) {
  return (
    <section className="components-section">
      <h2 className="components-section__title">{title}</h2>
      <p className="components-section__desc">
        <code>{desc}</code>
      </p>
      <div className={`components-section__demo ${demoClassName}`.trim()}>{children}</div>
    </section>
  );
}

export function Componentes() {
  const [pageView, setPageView] = useState<"components" | "map">("components");
  const [themeId, setThemeId] = useState(getSavedThemeId);
  const [modalOpen, setModalOpen] = useState(false);
  const [emptyLoading, setEmptyLoading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<DocumentPreviewFile | null>(null);
  const [msgMenuOpen, setMsgMenuOpen] = useState(false);
  const [msgMenuPos, setMsgMenuPos] = useState({ x: 120, y: 120 });
  const [sendLog, setSendLog] = useState("Envie uma mensagem ou anexe um arquivo.");

  useEffect(() => {
    document.title = pageView === "map" ? "Upmobb | Mapa do sistema" : "Upmobb | Componentes";
    document.body.classList.add("components-body");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    return () => document.body.classList.remove("components-body");
  }, [pageView]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  function openMsgMenu(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMsgMenuPos({ x: rect.left, y: rect.bottom + 8 });
    setMsgMenuOpen(true);
  }

  return (
    <div className={`components-page${pageView === "map" ? " components-page--map" : ""}`}>
      <div className="components-page__inner">
        <header className="components-page__hero">
          <div>
            <p className="components-page__eyebrow">Design system · docs</p>
            <h1 className="components-page__title">
              {pageView === "map" ? "Mapa do sistema" : "Componentes"}
            </h1>
            <p className="components-page__lead">
              {pageView === "map"
                ? "Caminho visual do app: quem chama quem (UI → service → dados)."
                : (
                  <>
                    Peças reutilizáveis em <code>src/componentes/</code>. Referência visual do chat React.
                  </>
                )}
            </p>
          </div>
          <Link className="components-page__back" to="/">
            ← Voltar
          </Link>
        </header>

        <nav className="components-page__tabs" aria-label="Seções">
          <button
            type="button"
            className={`components-page__tab${pageView === "components" ? " is-active" : ""}`}
            onClick={() => setPageView("components")}
          >
            Componentes
          </button>
          <button
            type="button"
            className={`components-page__tab${pageView === "map" ? " is-active" : ""}`}
            onClick={() => setPageView("map")}
          >
            Mapa do sistema
          </button>
        </nav>
      </div>

      {pageView === "map" ? <SystemMapView /> : null}

      {pageView === "components" ? (
        <div className="components-page__inner">
          <>
        <Section title="TopNav" desc="componentes/TopNav" demoClassName="components-section__demo--flush">
          <div className="components-demo-topnav">
            <TopNav
              active="conversas"
              searchQuery=""
              themeId={themeId}
              onSearchChange={() => {}}
              onNavigate={() => {}}
              onThemeChange={setThemeId}
              onLogout={() => {}}
            />
          </div>
        </Section>

        <Section title="NavLink" desc="componentes/NavLink">
          <nav className="top-nav__links top-nav__links--desktop components-demo-nav">
            <NavLink id="conversas" label="Conversas" active />
            <NavLink id="contatos" label="Contatos" />
          </nav>
        </Section>

        <Section title="AddButton" desc="componentes/AddButton" demoClassName="components-section__demo--row">
          <AddButton label="Adicionar" />
        </Section>

        <Section title="PageBackButton" desc="componentes/PageBackButton" demoClassName="components-section__demo--row">
          <PageBackButton />
        </Section>

        <Section title="FilterChip" desc="componentes/FilterChip" demoClassName="components-section__demo--row">
          <FilterChip id="todos" label="Todos" count={21} dropdown active wrapSlide={false} />
          <FilterChip id="resolvidos" label="Resolvidos" count={40} dropdown wrapSlide={false} />
          <FilterChip id="nao-lidas" label="Não lidas" count={5} wrapSlide={false} />
        </Section>

        <Section title="ChatItem" desc="componentes/ChatItem">
          <ul className="components-demo-list">
            {DEMO_CHATS.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </ul>
        </Section>

        <Section title="ChatListSkeleton" desc="componentes/ChatListSkeleton">
          <ul className="components-demo-list">
            <ChatListSkeleton count={3} />
          </ul>
        </Section>

        <Section title="MenuItem" desc="componentes/MenuItem" demoClassName="components-section__demo--stack">
          <MenuItem label="Transferir" action="transferir" />
          <MenuItem label="Deletar" action="deletar" danger />
        </Section>

        <Section title="ChatMoreMenu" desc="componentes/ChatMoreMenu" demoClassName="components-section__demo--menu">
          <div className={`chat-more${moreOpen ? " is-open" : ""} components-demo-more`}>
            <button
              type="button"
              className="icon-btn"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              <Icons.More />
            </button>
            <ChatMoreMenu open={moreOpen} onAction={() => setMoreOpen(false)} />
          </div>
        </Section>

        <Section title="ThemePickerMenu" desc="componentes/ThemePickerMenu" demoClassName="components-section__demo--menu">
          <div className={`theme-picker${themeMenuOpen ? " is-open" : ""} components-demo-theme`}>
            <button
              type="button"
              className="theme-picker__btn"
              aria-expanded={themeMenuOpen}
              onClick={() => setThemeMenuOpen((v) => !v)}
            >
              <Icons.Palette />
            </button>
            <ThemePickerMenu
              open={themeMenuOpen}
              themeId={themeId}
              onSelect={(id) => {
                setThemeId(id);
                setThemeMenuOpen(true);
              }}
            />
          </div>
        </Section>

        <Section title="MessageBubble" desc="componentes/MessageBubble">
          <div className="components-demo-messages">
            {DEMO_MESSAGES.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                senderName="Ana Souza - Acme Corp"
                onImageClick={setLightboxSrc}
                onDocumentClick={setDocFile}
              />
            ))}
          </div>
          <p className="components-section__hint">
            Clique na imagem (lightbox) ou no anexo (document preview). A bolha com citação usa texto claro no tema
            escuro.
          </p>
        </Section>

        <Section title="MessageMenu" desc="componentes/MessageMenu" demoClassName="components-section__demo--row">
          <button
            type="button"
            className="login-card__submit"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={openMsgMenu}
          >
            Abrir MessageMenu
          </button>
          <MessageMenu
            open={msgMenuOpen}
            x={msgMenuPos.x}
            y={msgMenuPos.y}
            canDelete
            onClose={() => setMsgMenuOpen(false)}
            onAction={() => setMsgMenuOpen(false)}
          />
        </Section>

        <Section title="ChatInput" desc="componentes/ChatInput">
          <div className="components-demo-composer">
            <ChatInput
              conversationId="demo"
              onSend={(payload) => {
                const n = payload.attachments.length;
                setSendLog(
                  n
                    ? `Enviado com ${n} anexo(s)${payload.text ? " + texto" : ""}.`
                    : `Enviado: “${payload.text}”`,
                );
              }}
            />
          </div>
          <p className="components-section__hint">{sendLog}</p>
        </Section>

        <Section title="ChatEmpty" desc="componentes/ChatEmpty">
          <div className="components-section__demo--row" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="login-card__submit"
              style={{ width: "auto", padding: "0 16px" }}
              onClick={() => setEmptyLoading((v) => !v)}
            >
              {emptyLoading ? "Parar loading" : "Ver loading"}
            </button>
          </div>
          <div className="components-demo-empty">
            <ChatEmpty loading={emptyLoading} />
          </div>
        </Section>

        <Section title="Lightbox" desc="componentes/Lightbox" demoClassName="components-section__demo--row">
          <button
            type="button"
            className="login-card__submit"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() =>
              setLightboxSrc(
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
              )
            }
          >
            Abrir lightbox
          </button>
        </Section>

        <Section title="DocumentPreview" desc="componentes/DocumentPreview" demoClassName="components-section__demo--row">
          <button
            type="button"
            className="login-card__submit"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() => setDocFile(DEMO_DOC)}
          >
            Abrir preview TXT
          </button>
          <button
            type="button"
            className="login-card__submit"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() => setDocFile(DEMO_PDF)}
          >
            Abrir preview PDF
          </button>
        </Section>

        <Section title="ConfirmModal" desc="componentes/ConfirmModal" demoClassName="components-section__demo--row">
          <button
            type="button"
            className="login-card__submit"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() => setModalOpen(true)}
          >
            Abrir modal
          </button>
          <ConfirmModal
            open={modalOpen}
            title="Excluir conversa?"
            description="Essa ação não pode ser desfeita."
            confirmLabel="Deletar"
            danger
            onCancel={() => setModalOpen(false)}
            onConfirm={() => setModalOpen(false)}
          />
        </Section>

        <Section title="Icons" desc="componentes/Icons" demoClassName="components-section__demo--icons">
          {(Object.keys(Icons) as Array<keyof typeof Icons>).map((name) => {
            const Icon = Icons[name];
            return (
              <span key={name} title={name}>
                <Icon />
              </span>
            );
          })}
        </Section>
          </>
        </div>
      ) : null}

      <Lightbox open={Boolean(lightboxSrc)} src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <DocumentPreview open={Boolean(docFile)} file={docFile} onClose={() => setDocFile(null)} />
    </div>
  );
}
