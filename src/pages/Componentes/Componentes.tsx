import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AddButton } from "@/componentes/AddButton/AddButton.tsx";
import { ChatEmpty } from "@/componentes/ChatEmpty/ChatEmpty.tsx";
import { ChatItem } from "@/componentes/ChatItem/ChatItem.tsx";
import { ConfirmModal } from "@/componentes/ConfirmModal/ConfirmModal.tsx";
import { FilterChip } from "@/componentes/FilterChip/FilterChip.tsx";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { MenuItem } from "@/componentes/MenuItem/MenuItem.tsx";
import { NavLink } from "@/componentes/NavLink/NavLink.tsx";
import { PageBackButton } from "@/componentes/PageBackButton/PageBackButton.tsx";
import { SAMPLE_CHATS } from "./Componentes.ts";
import "./Componentes.css";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [emptyLoading, setEmptyLoading] = useState(false);

  useEffect(() => {
    document.title = "Upmobb | Componentes";
  }, []);

  return (
    <div className="components-page">
      <div className="components-page__inner">
        <header className="components-page__hero">
          <div>
            <p className="components-page__eyebrow">Design system</p>
            <h1 className="components-page__title">Componentes</h1>
            <p className="components-page__lead">
              Peças reutilizáveis em <code>src/componentes/</code>. Use esta página como referência visual.
            </p>
          </div>
          <Link className="components-page__back" to="/">
            ← Voltar
          </Link>
        </header>

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
            {SAMPLE_CHATS.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </ul>
        </Section>

        <Section title="MenuItem" desc="componentes/MenuItem" demoClassName="components-section__demo--stack">
          <MenuItem label="Transferir" action="transferir" />
          <MenuItem label="Deletar" action="deletar" danger />
        </Section>

        <Section title="ChatEmpty" desc="componentes/ChatEmpty">
          <div className="components-section__demo--row" style={{ marginBottom: 12 }}>
            <button type="button" className="login-card__submit" style={{ width: "auto", padding: "0 16px" }} onClick={() => setEmptyLoading((v) => !v)}>
              {emptyLoading ? "Parar loading" : "Ver loading"}
            </button>
          </div>
          <div style={{ height: 120, position: "relative", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
            <ChatEmpty loading={emptyLoading} />
          </div>
        </Section>

        <Section title="ConfirmModal" desc="componentes/ConfirmModal" demoClassName="components-section__demo--row">
          <button type="button" className="login-card__submit" style={{ width: "auto", padding: "0 16px" }} onClick={() => setModalOpen(true)}>
            Abrir modal
          </button>
          <ConfirmModal
            open={modalOpen}
            title="Excluir conversa?"
            description="Essa ação não pode ser desfeita."
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

        <section className="components-section">
          <h2 className="components-section__title">Ainda vazios (estrutura pronta)</h2>
          <p className="components-section__pending">
            <code>TopNav</code>, <code>ChatList</code>, <code>ChatListSkeleton</code>, <code>ChatWindow</code>,{" "}
            <code>ChatInput</code>, <code>MessageBubble</code>, <code>MessageMenu</code>, <code>ChatMoreMenu</code>,{" "}
            <code>ThemePickerMenu</code>
          </p>
        </section>
      </div>
    </div>
  );
}
