import { NavLink } from "../ui/NavLink.js";
import { FilterChip } from "../ui/FilterChip.js";
import { ChatItem } from "../ui/ChatItem.js";
import { MenuItem } from "../ui/MenuItem.js";
import { AddButton } from "../ui/AddButton.js";
import { ThemePickerMenu, ChatMoreMenu } from "../ui/index.js";
import { chats } from "../data.js";
import { getSavedThemeId } from "../theme.js";
import { Icons } from "../icons.js";

const sampleChat = { ...chats[0], active: true };
const sampleChatIdle = { ...chats[1], active: false };

export function ComponentesPage() {
  return `
    <div class="components-page">
      <header class="components-page__hero">
        <div>
          <p class="components-page__eyebrow">Design system</p>
          <h1 class="components-page__title">Componentes</h1>
          <p class="components-page__lead">
            Peças reutilizáveis em <code>js/ui/</code>. Use esta página como referência visual.
          </p>
        </div>
        <a class="components-page__back" href="/">← Voltar ao chat</a>
      </header>

      <section class="components-section">
        <h2 class="components-section__title">NavLink</h2>
        <p class="components-section__desc"><code>js/ui/NavLink.js</code> — links da top nav</p>
        <div class="components-section__demo">
          <nav class="top-nav__links top-nav__links--desktop components-demo-nav">
            ${NavLink({ id: "conversas", label: "Conversas", active: true })}
            ${NavLink({ id: "contatos", label: "Contatos" })}
          </nav>
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">AddButton</h2>
        <p class="components-section__desc"><code>js/ui/AddButton.js</code> — botão + dos headers de página</p>
        <div class="components-section__demo components-section__demo--row">
          ${AddButton({ label: "Adicionar" })}
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">FilterChip</h2>
        <p class="components-section__desc"><code>js/ui/FilterChip.js</code></p>
        <div class="components-section__demo components-section__demo--row">
          ${FilterChip({ id: "todos", label: "Todos", count: 21, dropdown: true, active: true, wrapSlide: false })}
          ${FilterChip({ id: "resolvidos", label: "Resolvidos", count: 40, dropdown: true, wrapSlide: false })}
          ${FilterChip({ id: "nao-lidas", label: "Não lidas", count: 5, wrapSlide: false })}
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">ChatItem</h2>
        <p class="components-section__desc"><code>js/ui/ChatItem.js</code></p>
        <div class="components-section__demo">
          <ul class="chat-list__items components-demo-list">
            ${ChatItem(sampleChat)}
            ${ChatItem(sampleChatIdle)}
          </ul>
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">MenuItem</h2>
        <p class="components-section__desc"><code>js/ui/MenuItem.js</code> — botão para menus</p>
        <div class="components-section__demo components-section__demo--stack">
          ${MenuItem({ label: "Transferir", action: "transferir" })}
          ${MenuItem({ label: "Deletar", action: "deletar", danger: true })}
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">SubMenu — ThemePickerMenu</h2>
        <p class="components-section__desc"><code>js/ui/index.js</code> → <code>ThemePickerMenu</code></p>
        <div class="components-section__demo components-section__demo--menu">
          <div class="theme-picker is-open" style="position:relative">
            <button type="button" class="theme-picker__btn" aria-hidden="true">${Icons.palette}</button>
            ${ThemePickerMenu({ themeId: getSavedThemeId(), id: "demo-theme-menu", hidden: false })}
          </div>
        </div>
      </section>

      <section class="components-section">
        <h2 class="components-section__title">SubMenu — ChatMoreMenu</h2>
        <p class="components-section__desc"><code>js/ui/index.js</code> → <code>ChatMoreMenu</code></p>
        <div class="components-section__demo components-section__demo--menu">
          <div class="chat-more is-open" style="position:relative">
            <button type="button" class="icon-btn" aria-hidden="true">${Icons.more}</button>
            ${ChatMoreMenu({ id: "demo-chat-more-menu", hidden: false })}
          </div>
        </div>
      </section>
    </div>
  `;
}
