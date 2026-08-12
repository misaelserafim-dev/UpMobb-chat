import { TopNav } from "./components/TopNav.js";
import { renderChatItems } from "./components/ChatList.js";
import { MessageBubble } from "./components/MessageBubble.js";
import { MessageMenu } from "./components/MessageMenu.js";
import { ConfirmModal } from "./components/ConfirmModal.js";
import { ConversasPage } from "./pages/ConversasPage.js";
import { ContatosPage } from "./pages/ContatosPage.js";
import { EtiquetaPage } from "./pages/EtiquetaPage.js";
import { DepartamentoPage } from "./pages/DepartamentoPage.js";
import { RespostaRapidaPage } from "./pages/RespostaRapidaPage.js";
import { EquipePage } from "./pages/EquipePage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { initFiltersCarousel } from "./filtersCarousel.js";
import { applyListWidth, getSavedListWidth, initListResize } from "./listResize.js";
import { applyTheme, getSavedThemeId, initTheme } from "./theme.js";
import {
  chats as initialChats,
  contacts as initialContacts,
  departamentos as initialDepartamentos,
  etiquetas as initialEtiquetas,
  respostasRapidas as initialRespostasRapidas,
  messages as initialMessages,
} from "./data.js";
import {
  equipes as initialEquipes,
  emptyEquipePermissions,
} from "./data/equipe.js";
import { createContact, normalizeContact } from "./models/contact.js";
import { Icons } from "./icons.js";
import { applyPhoneMask, phonePlaceholder } from "./utils/phone.js";
import { escapeAttr } from "./utils/escape.js";

initTheme();
applyListWidth(getSavedListWidth());

let chats = [];
let contacts = initialContacts.map(normalizeContact);
let activeChat = null;
let messages = initialMessages.map((m) => ({ ...m }));
let pendingAttachments = [];
let replyTo = null;
let menuMessageId = null;
let mobilePanel = "list";
let activeFilter = "todos";
let searchQuery = "";
let msgSearchOpen = false;
let msgSearchQuery = "";
let confirmOnOk = null;
let activeNav = "conversas";
let contactsSearchQuery = "";
let contactModalOpen = false;
let contactDialCode = "+55";
let contactEtiquetaIds = [];
let themeId = getSavedThemeId();
let filtersEmbla = null;
let chatLoading = false;
let chatLoadToken = 0;
let listLoading = true;
let etiquetas = initialEtiquetas.map((e) => ({ ...e }));
let etiquetasSearchQuery = "";
let etiquetaModalOpen = false;
let etiquetaEditing = null;
let departamentos = initialDepartamentos.map((d) => ({ ...d }));
let departamentosSearchQuery = "";
let departamentoModalOpen = false;
let departamentoEditing = null;
let respostasRapidas = initialRespostasRapidas.map((r) => ({ ...r }));
let respostasRapidasSearchQuery = "";
let respostaRapidaModalOpen = false;
let respostaRapidaEditing = null;
let equipes = initialEquipes.map((m) => ({
  ...m,
  departamentoIds: [...(m.departamentoIds || [])],
  permissions: { ...emptyEquipePermissions(), ...(m.permissions || {}) },
}));
let equipesSearchQuery = "";
let equipeModalOpen = false;
let equipeEditing = null;
let equipePasswordVisible = false;
let equipeDepartamentoIds = [];

let isAuthenticated = false;
let loginMode = "login";
let loginEmail = "";
let loginPassword = "";
let loginRemember = false;
let loginError = "";
let loginResetSent = false;
let loginPasswordVisible = false;
let loginLoading = false;

try {
  localStorage.removeItem("upmobb-chat-auth");
  sessionStorage.removeItem("upmobb-chat-auth");
} catch {
  /* ignore */
}

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function senderLabel(from) {
  if (from === "out") return activeChat?.assignee || "Você";
  if (!activeChat) return "";
  return activeChat.company
    ? `${activeChat.name} - ${activeChat.company}`
    : activeChat.name;
}

function buildReplyPayload(msg) {
  return {
    id: msg.id,
    author: senderLabel(msg.from),
    text: msg.text || "",
    image: msg.image || null,
    video: msg.video || null,
    attachment: msg.attachment || null,
  };
}

function getContacts() {
  return contacts.map(normalizeContact);
}

function getPageHtml() {
  if (activeNav === "contatos") {
    return ContatosPage({
      contacts: getContacts(),
      searchQuery: contactsSearchQuery,
      modalOpen: contactModalOpen,
      dialCode: contactDialCode,
      etiquetas,
      selectedEtiquetaIds: contactEtiquetaIds,
    });
  }
  if (activeNav === "etiquetas") {
    return EtiquetaPage({
      etiquetas,
      searchQuery: etiquetasSearchQuery,
      modalOpen: etiquetaModalOpen,
      editing: etiquetaEditing,
    });
  }
  if (activeNav === "departamentos") {
    return DepartamentoPage({
      departamentos,
      searchQuery: departamentosSearchQuery,
      modalOpen: departamentoModalOpen,
      editing: departamentoEditing,
    });
  }
  if (activeNav === "respostas-rapidas") {
    return RespostaRapidaPage({
      respostas: respostasRapidas,
      searchQuery: respostasRapidasSearchQuery,
      modalOpen: respostaRapidaModalOpen,
      editing: respostaRapidaEditing,
    });
  }
  if (activeNav === "equipe") {
    return EquipePage({
      equipes,
      departamentos,
      searchQuery: equipesSearchQuery,
      modalOpen: equipeModalOpen,
      editing: equipeEditing,
      passwordVisible: equipePasswordVisible,
      selectedDepartamentoIds: equipeDepartamentoIds,
    });
  }
  return ConversasPage({
    chats: getVisibleChats(),
    activeChat,
    messages,
    pendingAttachments,
    replyTo,
    activeFilter,
    searchQuery,
    msgSearchOpen,
    msgSearchQuery,
    chatLoading,
    listLoading,
  });
}

function render({ scrollToEnd = false } = {}) {
  if (!isAuthenticated) {
    document.getElementById("root").innerHTML = LoginPage({
      mode: loginMode,
      email: loginEmail,
      password: loginPassword,
      remember: loginRemember,
      error: loginError,
      resetSent: loginResetSent,
      passwordVisible: loginPasswordVisible,
      loading: loginLoading,
    });
    bindLoginPage();
    document.title = "Upmobb | Login";
    return;
  }

  const messagesEl = document.getElementById("chat-messages");
  const savedScroll = messagesEl && !scrollToEnd ? messagesEl.scrollTop : null;

  document.getElementById("root").innerHTML = `
    <div class="app" data-mobile-panel="${mobilePanel}">
      ${TopNav({
        active: activeNav,
        themeId,
        searchQuery,
        searchDisabled: listLoading,
      })}
      <div class="workspace" id="workspace">
        ${getPageHtml()}
      </div>
    </div>
    ${lightboxMarkup()}
    ${MessageMenu({ canDelete: false })}
    ${ConfirmModal()}
  `;
  bindEvents();
  updateDocumentTitle();
  restoreChatScroll({ scrollToEnd, savedScroll });
}

function bindLoginPage() {
  const page = document.getElementById("login-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    e.preventDefault();

    if (form.id === "login-reset-form") {
      const email = document.getElementById("login-reset-email")?.value.trim() || "";
      if (!email) {
        loginError = "Informe o e-mail.";
        render();
        return;
      }
      loginEmail = email;
      loginError = "";
      loginResetSent = true;
      render();
      return;
    }

    if (form.id !== "login-form") return;
    if (loginLoading) return;

    loginEmail = document.getElementById("login-email")?.value.trim() || "";
    loginPassword = document.getElementById("login-password")?.value || "";
    loginRemember = Boolean(document.getElementById("login-remember")?.checked);
    loginError = "";
    loginLoading = true;

    form.querySelectorAll("input, button").forEach((el) => {
      el.disabled = true;
    });

    const actions = form.querySelector(".login-card__actions");
    const btn = form.querySelector(".login-card__submit");
    const SPINNER_URL = "https://resources.upmobb.tech/images/ico_pwa_192.png";
    let spinnerShown = false;

    const showSpinner = () => {
      if (spinnerShown || !actions) return;
      spinnerShown = true;
      btn?.remove();
      const wrap = document.createElement("span");
      wrap.className = "login-card__spinner-wrap";
      wrap.innerHTML = `<img class="login-card__spinner" src="${SPINNER_URL}" alt="" width="40" height="40" aria-hidden="true" />`;
      actions.appendChild(wrap);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => wrap.classList.add("is-visible"));
      });
    };

    if (btn) {
      btn.classList.add("is-leaving");
      const onLeave = (e) => {
        if (e && e.propertyName && e.propertyName !== "opacity") return;
        btn.removeEventListener("transitionend", onLeave);
        showSpinner();
      };
      btn.addEventListener("transitionend", onLeave);
      window.setTimeout(showSpinner, 320);
    } else {
      showSpinner();
    }

    window.setTimeout(() => {
      loginLoading = false;
      isAuthenticated = true;
      loginPassword = "";
      loginPasswordVisible = false;
      render({ scrollToEnd: true });
      loadChatList();
    }, 1100);
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("[data-login-forgot]")) {
      loginMode = "reset";
      loginError = "";
      loginResetSent = false;
      loginPassword = "";
      render();
      return;
    }

    if (e.target.closest("[data-login-back]")) {
      loginMode = "login";
      loginError = "";
      loginResetSent = false;
      render();
      return;
    }

    if (e.target.closest("#login-password-toggle")) {
      loginPasswordVisible = !loginPasswordVisible;
      const input = document.getElementById("login-password");
      const btn = document.getElementById("login-password-toggle");
      if (input) input.type = loginPasswordVisible ? "text" : "password";
      if (btn) {
        btn.innerHTML = loginPasswordVisible ? Icons.eyeOff : Icons.eye;
        const label = loginPasswordVisible ? "Ocultar senha" : "Mostrar senha";
        btn.setAttribute("aria-label", label);
        btn.title = label;
      }
    }
  });
}

function renderActivePage({ scrollToEnd = false } = {}) {
  const workspace = document.getElementById("workspace");
  if (!workspace) {
    render({ scrollToEnd });
    return;
  }

  const messagesEl = document.getElementById("chat-messages");
  const savedScroll = messagesEl && !scrollToEnd ? messagesEl.scrollTop : null;

  workspace.innerHTML = getPageHtml();
  bindWorkspace();
  updateDocumentTitle();
  restoreChatScroll({ scrollToEnd, savedScroll });
}

function restoreChatScroll({ scrollToEnd = false, savedScroll = null } = {}) {
  if (activeNav !== "conversas") return;
  if (msgSearchOpen && msgSearchQuery) applyMessageSearch(msgSearchQuery);

  const nextMessages = document.getElementById("chat-messages");
  if (!nextMessages) return;

  if (scrollToEnd && mobilePanel !== "list") {
    stickMessagesToEnd(nextMessages);
  } else if (savedScroll != null) {
    nextMessages.scrollTop = savedScroll;
  }
}

function updateDocumentTitle() {
  if (activeNav === "contatos") {
    document.title = "Upmobb | Contatos";
    return;
  }
  if (activeNav === "etiquetas") {
    document.title = "Upmobb | Etiqueta";
    return;
  }
  if (activeNav === "departamentos") {
    document.title = "Upmobb | Departamento";
    return;
  }
  if (activeNav === "respostas-rapidas") {
    document.title = "Upmobb | Resposta rápida";
    return;
  }
  if (activeNav === "equipe") {
    document.title = "Upmobb | Equipe";
    return;
  }
  document.title = activeChat?.name
    ? `conversando com ${activeChat.name}`
    : "Upmobb | Chat";
}

/** Mantém o fim da conversa visível mesmo após imagens/vídeos carregarem */
function stickMessagesToEnd(list) {
  if (!list) return;

  const pin = () => {
    list.scrollTop = list.scrollHeight;
  };

  pin();
  requestAnimationFrame(() => {
    pin();
    requestAnimationFrame(pin);
  });

  const media = list.querySelectorAll("img, video");
  media.forEach((el) => {
    if (el.tagName === "IMG") {
      if (!el.complete) el.addEventListener("load", pin, { once: true });
      el.addEventListener("error", pin, { once: true });
    } else {
      el.addEventListener("loadedmetadata", pin, { once: true });
      el.addEventListener("loadeddata", pin, { once: true });
    }
  });

  // fallback curto caso a mídia demore a disparar eventos
  setTimeout(pin, 100);
  setTimeout(pin, 400);
}

function lightboxMarkup() {
  return `
    <div class="lightbox" id="lightbox" hidden>
      <button type="button" class="lightbox__close" id="lightbox-close" aria-label="Fechar zoom">
        ${Icons.x}
      </button>
      <img class="lightbox__img" id="lightbox-img" alt="Imagem ampliada" />
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-submenu-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleNavSubmenu(btn);
    });
  });

  document.querySelectorAll("[data-nav]:not([data-submenu-toggle])").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const next = link.dataset.nav;
      if (!next || next === activeNav) {
        closeAllNavSubmenus();
        return;
      }
      activeNav = next;
      syncNavActiveState();

      const navPanel = document.getElementById("nav-menu-panel");
      if (navPanel && !navPanel.hidden) {
        setNavMenuOpen(false);
      }

      closeAllNavSubmenus();
      renderActivePage();
    });
  });

  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllNavSubmenus();
      const navPanel = document.getElementById("nav-menu-panel");
      if (navPanel && !navPanel.hidden) setNavMenuOpen(false);
      isAuthenticated = false;
      loginMode = "login";
      loginError = "";
      loginPassword = "";
      loginPasswordVisible = false;
      loginResetSent = false;
      loginLoading = false;
      render();
    });
  });

  if (!document.documentElement.dataset.navSubmenuBound) {
    document.documentElement.dataset.navSubmenuBound = "1";
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-submenu")) closeAllNavSubmenus();
    });
  }

  bindNavMenu();
  bindThemePicker();
  bindLightbox();
  bindConfirmModal();
  bindWorkspace();
}

function syncNavActiveState() {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.classList.contains("nav-submenu__trigger")) {
      el.classList.toggle(
        "top-nav__link--active",
        activeNav === "etiquetas" ||
          activeNav === "departamentos" ||
          activeNav === "respostas-rapidas" ||
          activeNav === "equipe"
      );
      return;
    }
    if (el.classList.contains("nav-submenu__item")) {
      el.classList.toggle("is-active", el.dataset.nav === activeNav);
      return;
    }
    el.classList.toggle("top-nav__link--active", el.dataset.nav === activeNav);
  });
}

function toggleNavSubmenu(trigger) {
  const menuId = trigger.getAttribute("aria-controls");
  const menu = menuId ? document.getElementById(menuId) : null;
  if (!menu) return;
  const open = menu.hidden;
  closeAllNavSubmenus();
  menu.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
  trigger.closest(".nav-submenu")?.classList.toggle("is-open", open);
}

function closeAllNavSubmenus() {
  document.querySelectorAll(".nav-submenu__menu").forEach((menu) => {
    menu.hidden = true;
  });
  document.querySelectorAll("[data-submenu-toggle]").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.closest(".nav-submenu")?.classList.remove("is-open");
  });
}

function bindWorkspace() {
  if (activeNav === "contatos") {
    bindContatosPage();
    bindPageBack();
    return;
  }
  if (activeNav === "etiquetas") {
    bindEtiquetaPage();
    bindPageBack();
    return;
  }
  if (activeNav === "departamentos") {
    bindDepartamentoPage();
    bindPageBack();
    return;
  }
  if (activeNav === "respostas-rapidas") {
    bindRespostaRapidaPage();
    bindPageBack();
    return;
  }
  if (activeNav === "equipe") {
    bindEquipePage();
    bindPageBack();
    return;
  }

  bindComposer();
  bindMessageMenu();
  bindSearch();
  bindChatItems();
  bindChatHeaderMenus();
  filtersEmbla = initFiltersCarousel();
  initListResize();

  document.querySelector(".chat-window__back:not([data-page-back])")?.addEventListener("click", () => {
    leaveConversation();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      render();
    });
  });
}

function bindPageBack() {
  document.querySelector("[data-page-back]")?.addEventListener("click", () => {
    navigateBackFromPage();
  });
}

function navigateBackFromPage() {
  activeNav = "conversas";
  syncNavActiveState();
  closeAllNavSubmenus();
  renderActivePage();
}

function bindContatosPage() {
  const page = document.getElementById("contatos-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("input", (e) => {
    if (e.target?.id === "contatos-search") {
      contactsSearchQuery = e.target.value;
      refreshContatosList();
      return;
    }
    if (e.target?.id === "phone-ddi-search") {
      filterDialOptions(e.target.value);
      return;
    }
    if (e.target?.id === "etiqueta-select-search") {
      filterEtiquetaOptions(e.target.value);
      return;
    }
    if (e.target?.id === "contact-add-phone") {
      applyPhoneMask(e.target, contactDialCode);
    }
  });

  page.addEventListener("submit", (e) => {
    if (e.target?.id !== "contact-add-form") return;
    e.preventDefault();
    const name = document.getElementById("contact-add-name")?.value.trim();
    const phoneNumber = document.getElementById("contact-add-phone")?.value.trim();
    const email = document.getElementById("contact-add-email")?.value.trim() || "";
    const notes = document.getElementById("contact-add-notes")?.value.trim() || "";
    if (!name || !phoneNumber) return;

    const phone = `${contactDialCode} ${phoneNumber}`.trim();
    const selectedTags = etiquetas
      .filter((et) => contactEtiquetaIds.includes(et.id))
      .map((et) => ({
        id: et.id,
        type: "color",
        label: et.name,
        color: et.color,
      }));
    contacts = [
      createContact({
        name,
        phone,
        email,
        notes,
        tags: selectedTags,
      }),
      ...contacts,
    ];
    closeContactModal();
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("#contatos-add-btn")) {
      openContactModal();
      return;
    }

    if (e.target.closest("[data-contact-modal-close]")) {
      closeContactModal();
      return;
    }

    if (e.target.closest("[data-contact-etiqueta-clear]")) {
      contactEtiquetaIds = [];
      syncEtiquetaSelectUI();
      return;
    }

    const etiquetaOpt = e.target.closest("[data-contact-etiqueta]");
    if (etiquetaOpt && e.target.closest("#etiqueta-select")) {
      const id = etiquetaOpt.dataset.contactEtiqueta || "";
      if (!id) return;
      contactEtiquetaIds = contactEtiquetaIds.includes(id)
        ? contactEtiquetaIds.filter((x) => x !== id)
        : [...contactEtiquetaIds, id];
      syncEtiquetaSelectUI();
      return;
    }

    if (e.target.closest("#etiqueta-select-btn")) {
      toggleEtiquetaSelect();
      return;
    }

    if (!e.target.closest("#etiqueta-select")) {
      closeEtiquetaSelect();
    }

    const ddiBtn = e.target.closest("#phone-ddi-btn");
    if (ddiBtn) {
      closeEtiquetaSelect();
      toggleDialMenu();
      return;
    }

    const option = e.target.closest(".phone-ddi__option");
    if (option) {
      contactDialCode = option.dataset.dial || "+55";
      const menu = document.getElementById("phone-ddi-menu");
      const trigger = document.getElementById("phone-ddi-btn");
      const phoneInput = document.getElementById("contact-add-phone");
      if (trigger) {
        const flag = option.querySelector(".phone-ddi__flag")?.textContent || "";
        const code = option.dataset.dial || "+55";
        const flagEl = trigger.querySelector(".phone-ddi__flag");
        const codeEl = trigger.querySelector(".phone-ddi__code");
        if (flagEl) flagEl.textContent = flag;
        if (codeEl) codeEl.textContent = code;
      }
      if (phoneInput) {
        phoneInput.placeholder = phonePlaceholder(contactDialCode);
        applyPhoneMask(phoneInput, contactDialCode);
      }
      if (menu) menu.hidden = true;
      trigger?.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".phone-ddi__option").forEach((el) => {
        const on = el === option;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", String(on));
      });
      return;
    }

    if (!e.target.closest(".phone-ddi")) {
      const menu = document.getElementById("phone-ddi-menu");
      if (menu && !menu.hidden) {
        menu.hidden = true;
        document.getElementById("phone-ddi-btn")?.setAttribute("aria-expanded", "false");
      }
    }

    const btn = e.target.closest("[data-contact-action='deletar']");
    if (!btn || !page.contains(btn)) return;
    e.stopPropagation();

    const id = btn.dataset.contactId;
    const person = contacts.find((c) => c.id === id);
    if (!person) return;

    openConfirmModal({
      title: "Deletar contato?",
      description: `${person.name} será removido da lista de contatos. Essa ação não pode ser desfeita.`,
      confirmText: "Deletar",
      cancelText: "Cancelar",
      danger: true,
      onConfirm: () => deleteContact(id),
    });
  });
}

function openContactModal() {
  contactModalOpen = true;
  contactDialCode = "+55";
  contactEtiquetaIds = [];
  renderActivePage();
  requestAnimationFrame(() => {
    document.getElementById("contact-add-name")?.focus();
  });
}

function closeContactModal() {
  contactModalOpen = false;
  contactDialCode = "+55";
  contactEtiquetaIds = [];
  renderActivePage();
}

function toggleDialMenu() {
  const menu = document.getElementById("phone-ddi-menu");
  const btn = document.getElementById("phone-ddi-btn");
  if (!menu || !btn) return;
  const open = menu.hidden;
  menu.hidden = !open;
  btn.setAttribute("aria-expanded", String(open));
  if (open) {
    const search = document.getElementById("phone-ddi-search");
    if (search) {
      search.value = "";
      filterDialOptions("");
      search.focus();
    }
  }
}

function filterDialOptions(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll(".phone-ddi__option").forEach((el) => {
    const name = el.querySelector(".phone-ddi__name")?.textContent?.toLowerCase() || "";
    const dial = el.dataset.dial?.toLowerCase() || "";
    const iso = el.dataset.iso?.toLowerCase() || "";
    const match = !q || name.includes(q) || dial.includes(q) || iso.includes(q);
    el.hidden = !match;
  });
}

function toggleEtiquetaSelect() {
  const menu = document.getElementById("etiqueta-select-menu");
  const btn = document.getElementById("etiqueta-select-btn");
  if (!menu || !btn) return;
  const open = menu.hidden;
  if (open) {
    const dialMenu = document.getElementById("phone-ddi-menu");
    if (dialMenu && !dialMenu.hidden) {
      dialMenu.hidden = true;
      document.getElementById("phone-ddi-btn")?.setAttribute("aria-expanded", "false");
    }
  }
  menu.hidden = !open;
  btn.setAttribute("aria-expanded", String(open));
  if (open) {
    const search = document.getElementById("etiqueta-select-search");
    if (search) {
      search.value = "";
      filterEtiquetaOptions("");
      search.focus();
    }
  }
}

function closeEtiquetaSelect() {
  const menu = document.getElementById("etiqueta-select-menu");
  const btn = document.getElementById("etiqueta-select-btn");
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  btn?.setAttribute("aria-expanded", "false");
}

function filterEtiquetaOptions(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll("#etiqueta-select-list .etiqueta-select__option").forEach((el) => {
    const name =
      el.dataset.etiquetaName?.toLowerCase() ||
      el.querySelector(".etiqueta-select__option-name")?.textContent?.toLowerCase() ||
      "";
    const match = !q || name.includes(q);
    el.hidden = !match;
  });
}

function syncEtiquetaSelectUI() {
  const value = document.getElementById("etiqueta-select-value");
  if (value) {
    const selected = etiquetas.filter((et) => contactEtiquetaIds.includes(et.id));
    value.replaceChildren();
    if (selected.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "etiqueta-select__placeholder";
      placeholder.textContent = "Selecionar etiquetas";
      value.appendChild(placeholder);
    } else {
      selected.forEach((et) => {
        const chip = document.createElement("span");
        chip.className = "etiqueta-chip etiqueta-select__chip";
        chip.style.setProperty("--etiqueta-color", et.color);
        const bar = document.createElement("span");
        bar.className = "etiqueta-chip__bar";
        bar.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "etiqueta-chip__name";
        name.textContent = et.name;
        chip.append(bar, name);
        value.appendChild(chip);
      });
    }
  }

  document.querySelectorAll("#etiqueta-select-list .etiqueta-select__option[data-contact-etiqueta]").forEach((el) => {
    const id = el.dataset.contactEtiqueta || "";
    const on = contactEtiquetaIds.includes(id);
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-selected", String(on));
  });

  const clearBtn = document.querySelector("[data-contact-etiqueta-clear]");
  if (clearBtn) clearBtn.hidden = contactEtiquetaIds.length === 0;
}

function refreshContatosList() {
  const list = document.getElementById("contatos-list");
  if (!list) return;
  const page = ContatosPage({
    contacts: getContacts(),
    searchQuery: contactsSearchQuery,
    modalOpen: contactModalOpen,
    dialCode: contactDialCode,
    etiquetas,
    selectedEtiquetaIds: contactEtiquetaIds,
  });
  const tmp = document.createElement("div");
  tmp.innerHTML = page;
  const nextList = tmp.querySelector("#contatos-list");
  const nextCount = tmp.querySelector(".chat-window__assignee");
  if (nextList) list.replaceWith(nextList);
  const countEl = document.querySelector("#contatos-page .chat-window__assignee");
  if (countEl && nextCount) countEl.textContent = nextCount.textContent;
}

function deleteContact(id) {
  contacts = contacts.filter((c) => c.id !== id);
  renderActivePage();
}

function bindEtiquetaPage() {
  const page = document.getElementById("etiqueta-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("input", (e) => {
    if (e.target?.id === "etiqueta-search") {
      etiquetasSearchQuery = e.target.value;
      refreshEtiquetaList();
      return;
    }
    if (e.target?.id === "etiqueta-color") {
      e.target.dataset.colorSet = "true";
      document
        .getElementById("etiqueta-color-wrap")
        ?.classList.remove("is-empty", "is-invalid");
    }
  });

  page.addEventListener("submit", (e) => {
    if (e.target?.id !== "etiqueta-form") return;
    e.preventDefault();
    const nameInput = document.getElementById("etiqueta-name");
    const colorInput = document.getElementById("etiqueta-color");
    const colorWrap = document.getElementById("etiqueta-color-wrap");
    const editId = document.getElementById("etiqueta-edit-id")?.value || "";

    const name = nameInput?.value.trim();
    if (!name) {
      nameInput?.focus();
      return;
    }
    if (colorInput?.dataset.colorSet !== "true") {
      colorWrap?.classList.add("is-invalid");
      colorInput?.click();
      return;
    }

    const payload = {
      name,
      color: colorInput.value,
    };

    if (editId) {
      etiquetas = etiquetas.map((et) =>
        et.id === editId ? { ...et, ...payload } : et
      );
    } else {
      etiquetas = [
        {
          id: `etq-${Date.now()}`,
          ...payload,
        },
        ...etiquetas,
      ];
    }

    closeEtiquetaModal();
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("#etiqueta-add-btn")) {
      openEtiquetaModal();
      return;
    }

    if (e.target.closest("[data-etiqueta-modal-close]")) {
      closeEtiquetaModal();
      return;
    }

    const btn = e.target.closest("[data-etiqueta-action]");
    if (!btn || !page.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.etiquetaId;
    const action = btn.dataset.etiquetaAction;

    if (action === "editar") {
      const item = etiquetas.find((et) => et.id === id);
      if (!item) return;
      openEtiquetaModal(item);
      return;
    }

    if (action === "deletar") {
      const item = etiquetas.find((et) => et.id === id);
      if (!item) return;
      openConfirmModal({
        title: "Remover etiqueta?",
        description: `A etiqueta "${item.name}" será removida. Essa ação não pode ser desfeita.`,
        confirmText: "Remover",
        cancelText: "Cancelar",
        danger: true,
        onConfirm: () => {
          etiquetas = etiquetas.filter((et) => et.id !== id);
          if (etiquetaEditing?.id === id) {
            etiquetaEditing = null;
            etiquetaModalOpen = false;
          }
          renderActivePage();
        },
      });
    }
  });
}

function openEtiquetaModal(editing = null) {
  etiquetaModalOpen = true;
  etiquetaEditing = editing;
  renderActivePage();
  requestAnimationFrame(() => {
    document.getElementById("etiqueta-name")?.focus();
  });
}

function closeEtiquetaModal() {
  etiquetaModalOpen = false;
  etiquetaEditing = null;
  renderActivePage();
}

function refreshEtiquetaList() {
  const grid = document.getElementById("etiqueta-grid");
  const empty = document.querySelector("#etiqueta-page .page-panel__empty");
  const container = document.querySelector("#etiqueta-page .page-panel__body .page-container");
  if (!container) return;

  const page = EtiquetaPage({
    etiquetas,
    searchQuery: etiquetasSearchQuery,
    modalOpen: etiquetaModalOpen,
    editing: etiquetaEditing,
  });
  const tmp = document.createElement("div");
  tmp.innerHTML = page;
  const nextGrid = tmp.querySelector("#etiqueta-grid");
  const nextEmpty = tmp.querySelector(".page-panel__empty");
  const nextCount = tmp.querySelector(".chat-window__assignee");
  const countEl = document.querySelector("#etiqueta-page .chat-window__assignee");
  if (countEl && nextCount) countEl.textContent = nextCount.textContent;

  if (grid && nextGrid) {
    grid.replaceWith(nextGrid);
    return;
  }
  if (empty && nextGrid) {
    empty.replaceWith(nextGrid);
    return;
  }
  if (grid && nextEmpty) {
    grid.replaceWith(nextEmpty);
    return;
  }
  if (empty && nextEmpty) {
    empty.replaceWith(nextEmpty);
  }
}

function bindDepartamentoPage() {
  const page = document.getElementById("departamento-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("input", (e) => {
    if (e.target?.id === "departamento-search") {
      departamentosSearchQuery = e.target.value;
      refreshDepartamentoList();
      return;
    }
    if (e.target?.id === "departamento-color") {
      e.target.dataset.colorSet = "true";
      document
        .getElementById("departamento-color-wrap")
        ?.classList.remove("is-empty", "is-invalid");
    }
  });

  page.addEventListener("submit", (e) => {
    if (e.target?.id !== "departamento-form") return;
    e.preventDefault();
    const nameInput = document.getElementById("departamento-name");
    const colorInput = document.getElementById("departamento-color");
    const colorWrap = document.getElementById("departamento-color-wrap");
    const greetingInput = document.getElementById("departamento-greeting");
    const editId = document.getElementById("departamento-edit-id")?.value || "";

    const name = nameInput?.value.trim();
    const greeting = greetingInput?.value.trim();
    if (!name) {
      nameInput?.focus();
      return;
    }
    if (!greeting) {
      greetingInput?.focus();
      return;
    }
    if (colorInput?.dataset.colorSet !== "true") {
      colorWrap?.classList.add("is-invalid");
      colorInput?.click();
      return;
    }

    const payload = {
      name,
      color: colorInput.value,
      greeting,
    };

    if (editId) {
      departamentos = departamentos.map((d) =>
        d.id === editId ? { ...d, ...payload } : d
      );
    } else {
      departamentos = [
        {
          id: `dept-${Date.now()}`,
          ...payload,
        },
        ...departamentos,
      ];
    }

    closeDepartamentoModal();
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("#departamento-add-btn")) {
      openDepartamentoModal();
      return;
    }

    if (e.target.closest("[data-departamento-modal-close]")) {
      closeDepartamentoModal();
      return;
    }

    const btn = e.target.closest("[data-departamento-action]");
    if (!btn || !page.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.departamentoId;
    const action = btn.dataset.departamentoAction;

    if (action === "editar") {
      const item = departamentos.find((d) => d.id === id);
      if (!item) return;
      openDepartamentoModal(item);
      return;
    }

    if (action === "deletar") {
      const item = departamentos.find((d) => d.id === id);
      if (!item) return;
      openConfirmModal({
        title: "Remover departamento?",
        description: `O departamento "${item.name}" será removido. Essa ação não pode ser desfeita.`,
        confirmText: "Remover",
        cancelText: "Cancelar",
        danger: true,
        onConfirm: () => {
          departamentos = departamentos.filter((d) => d.id !== id);
          if (departamentoEditing?.id === id) {
            departamentoEditing = null;
            departamentoModalOpen = false;
          }
          renderActivePage();
        },
      });
    }
  });
}

function openDepartamentoModal(editing = null) {
  departamentoModalOpen = true;
  departamentoEditing = editing;
  renderActivePage();
  requestAnimationFrame(() => {
    document.getElementById("departamento-name")?.focus();
  });
}

function closeDepartamentoModal() {
  departamentoModalOpen = false;
  departamentoEditing = null;
  renderActivePage();
}

function refreshDepartamentoList() {
  const list = document.getElementById("departamento-list");
  if (!list) return;
  const page = DepartamentoPage({
    departamentos,
    searchQuery: departamentosSearchQuery,
    modalOpen: departamentoModalOpen,
    editing: departamentoEditing,
  });
  const tmp = document.createElement("div");
  tmp.innerHTML = page;
  const nextList = tmp.querySelector("#departamento-list");
  const nextCount = tmp.querySelector(".chat-window__assignee");
  if (nextList) list.replaceWith(nextList);
  const countEl = document.querySelector("#departamento-page .chat-window__assignee");
  if (countEl && nextCount) countEl.textContent = nextCount.textContent;
}

function bindRespostaRapidaPage() {
  const page = document.getElementById("resposta-rapida-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("input", (e) => {
    if (e.target?.id === "resposta-rapida-search") {
      respostasRapidasSearchQuery = e.target.value;
      refreshRespostaRapidaList();
    }
  });

  page.addEventListener("submit", (e) => {
    if (e.target?.id !== "resposta-rapida-form") return;
    e.preventDefault();
    const shortcutInput = document.getElementById("resposta-rapida-shortcut");
    const textInput = document.getElementById("resposta-rapida-text");
    const editId = document.getElementById("resposta-rapida-edit-id")?.value || "";

    const shortcut = shortcutInput?.value.trim().replace(/^\/+/, "");
    const text = textInput?.value.trim();
    if (!shortcut) {
      shortcutInput?.focus();
      return;
    }
    if (!text) {
      textInput?.focus();
      return;
    }

    const payload = { shortcut, text };

    if (editId) {
      respostasRapidas = respostasRapidas.map((r) =>
        r.id === editId ? { ...r, ...payload } : r
      );
    } else {
      respostasRapidas = [
        {
          id: `rr-${Date.now()}`,
          ...payload,
        },
        ...respostasRapidas,
      ];
    }

    closeRespostaRapidaModal();
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("#resposta-rapida-add-btn")) {
      openRespostaRapidaModal();
      return;
    }

    if (e.target.closest("[data-resposta-modal-close]")) {
      closeRespostaRapidaModal();
      return;
    }

    const btn = e.target.closest("[data-resposta-action]");
    if (!btn || !page.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.respostaId;
    const action = btn.dataset.respostaAction;

    if (action === "editar") {
      const item = respostasRapidas.find((r) => r.id === id);
      if (!item) return;
      openRespostaRapidaModal(item);
      return;
    }

    if (action === "deletar") {
      const item = respostasRapidas.find((r) => r.id === id);
      if (!item) return;
      openConfirmModal({
        title: "Remover resposta rápida?",
        description: `A resposta "${item.shortcut}" será removida. Essa ação não pode ser desfeita.`,
        confirmText: "Remover",
        cancelText: "Cancelar",
        danger: true,
        onConfirm: () => {
          respostasRapidas = respostasRapidas.filter((r) => r.id !== id);
          if (respostaRapidaEditing?.id === id) {
            respostaRapidaEditing = null;
            respostaRapidaModalOpen = false;
          }
          renderActivePage();
        },
      });
    }
  });
}

function openRespostaRapidaModal(editing = null) {
  respostaRapidaModalOpen = true;
  respostaRapidaEditing = editing;
  renderActivePage();
  requestAnimationFrame(() => {
    document.getElementById("resposta-rapida-shortcut")?.focus();
  });
}

function closeRespostaRapidaModal() {
  respostaRapidaModalOpen = false;
  respostaRapidaEditing = null;
  renderActivePage();
}

function refreshRespostaRapidaList() {
  const list = document.getElementById("resposta-rapida-list");
  if (!list) return;
  const page = RespostaRapidaPage({
    respostas: respostasRapidas,
    searchQuery: respostasRapidasSearchQuery,
    modalOpen: respostaRapidaModalOpen,
    editing: respostaRapidaEditing,
  });
  const tmp = document.createElement("div");
  tmp.innerHTML = page;
  const nextList = tmp.querySelector("#resposta-rapida-list");
  const nextCount = tmp.querySelector(".chat-window__assignee");
  if (nextList) list.replaceWith(nextList);
  const countEl = document.querySelector("#resposta-rapida-page .chat-window__assignee");
  if (countEl && nextCount) countEl.textContent = nextCount.textContent;
}

function bindEquipePage() {
  const page = document.getElementById("equipe-page");
  if (!page || page.dataset.bound === "1") return;
  page.dataset.bound = "1";

  page.addEventListener("input", (e) => {
    if (e.target?.id === "equipe-search") {
      equipesSearchQuery = e.target.value;
      refreshEquipeList();
      return;
    }
    if (e.target?.id === "equipe-dept-select-search") {
      filterEquipeDeptOptions(e.target.value);
    }
  });

  page.addEventListener("submit", (e) => {
    if (e.target?.id !== "equipe-form") return;
    e.preventDefault();

    const name = document.getElementById("equipe-name")?.value.trim();
    const password = document.getElementById("equipe-password")?.value || "";
    const email = document.getElementById("equipe-email")?.value.trim();
    const connectionId = document.getElementById("equipe-connection")?.value || "";
    const profile = document.getElementById("equipe-profile")?.value || "";
    const editId = document.getElementById("equipe-edit-id")?.value || "";

    if (!name || !email || !connectionId || !profile) return;
    if (!editId && !password) {
      document.getElementById("equipe-password")?.focus();
      return;
    }

    const permissions = { ...emptyEquipePermissions() };
    page.querySelectorAll('#equipe-form input[name="permission"]').forEach((el) => {
      permissions[el.value] = el.checked;
    });

    const payload = {
      name,
      email,
      connectionId,
      profile,
      departamentoIds: [...equipeDepartamentoIds],
      permissions,
    };

    if (editId) {
      equipes = equipes.map((m) =>
        m.id === editId
          ? {
              ...m,
              ...payload,
              password: password || m.password,
            }
          : m
      );
    } else {
      equipes = [
        {
          id: `eq-${Date.now()}`,
          password,
          status: "offline",
          ...payload,
        },
        ...equipes,
      ];
    }

    closeEquipeModal();
  });

  page.addEventListener("click", (e) => {
    if (e.target.closest("#equipe-add-btn")) {
      openEquipeModal();
      return;
    }

    if (e.target.closest("[data-equipe-modal-close]")) {
      closeEquipeModal();
      return;
    }

    if (e.target.closest("#equipe-password-toggle")) {
      equipePasswordVisible = !equipePasswordVisible;
      const input = document.getElementById("equipe-password");
      const btn = document.getElementById("equipe-password-toggle");
      if (input) input.type = equipePasswordVisible ? "text" : "password";
      if (btn) {
        btn.innerHTML = equipePasswordVisible ? Icons.eyeOff : Icons.eye;
        const label = equipePasswordVisible ? "Ocultar senha" : "Mostrar senha";
        btn.setAttribute("aria-label", label);
        btn.title = label;
      }
      return;
    }

    if (e.target.closest("[data-equipe-dept-clear]")) {
      equipeDepartamentoIds = [];
      syncEquipeDeptSelectUI();
      return;
    }

    const deptOpt = e.target.closest("[data-equipe-dept]");
    if (deptOpt && e.target.closest("#equipe-dept-select")) {
      const id = deptOpt.dataset.equipeDept || "";
      if (!id) return;
      equipeDepartamentoIds = equipeDepartamentoIds.includes(id)
        ? equipeDepartamentoIds.filter((x) => x !== id)
        : [...equipeDepartamentoIds, id];
      syncEquipeDeptSelectUI();
      return;
    }

    if (e.target.closest("#equipe-dept-select-btn")) {
      toggleEquipeDeptSelect();
      return;
    }

    if (!e.target.closest("#equipe-dept-select")) {
      closeEquipeDeptSelect();
    }

    const btn = e.target.closest("[data-equipe-action]");
    if (!btn || !page.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.equipeId;
    const action = btn.dataset.equipeAction;

    if (action === "editar") {
      const item = equipes.find((m) => m.id === id);
      if (!item) return;
      openEquipeModal(item);
      return;
    }

    if (action === "deletar") {
      const item = equipes.find((m) => m.id === id);
      if (!item) return;
      openConfirmModal({
        title: "Remover membro?",
        description: `${item.name} será removido da equipe. Essa ação não pode ser desfeita.`,
        confirmText: "Remover",
        cancelText: "Cancelar",
        danger: true,
        onConfirm: () => {
          equipes = equipes.filter((m) => m.id !== id);
          if (equipeEditing?.id === id) {
            equipeEditing = null;
            equipeModalOpen = false;
            equipeDepartamentoIds = [];
          }
          renderActivePage();
        },
      });
    }
  });
}

function toggleEquipeDeptSelect() {
  const menu = document.getElementById("equipe-dept-select-menu");
  const btn = document.getElementById("equipe-dept-select-btn");
  if (!menu || !btn) return;
  const open = menu.hidden;
  menu.hidden = !open;
  btn.setAttribute("aria-expanded", String(open));
  if (open) {
    const search = document.getElementById("equipe-dept-select-search");
    if (search) {
      search.value = "";
      filterEquipeDeptOptions("");
      search.focus();
    }
  }
}

function closeEquipeDeptSelect() {
  const menu = document.getElementById("equipe-dept-select-menu");
  const btn = document.getElementById("equipe-dept-select-btn");
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  btn?.setAttribute("aria-expanded", "false");
}

function filterEquipeDeptOptions(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll("#equipe-dept-select-list .etiqueta-select__option").forEach((el) => {
    const name = el.dataset.deptName?.toLowerCase() || "";
    el.hidden = Boolean(q) && !name.includes(q);
  });
}

function syncEquipeDeptSelectUI() {
  const value = document.getElementById("equipe-dept-select-value");
  if (value) {
    const selected = departamentos.filter((d) => equipeDepartamentoIds.includes(d.id));
    value.replaceChildren();
    if (selected.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "etiqueta-select__placeholder";
      placeholder.textContent = "Selecionar departamentos";
      value.appendChild(placeholder);
    } else {
      selected.forEach((d) => {
        const chip = document.createElement("span");
        chip.className = "etiqueta-chip etiqueta-select__chip";
        chip.style.setProperty("--etiqueta-color", d.color);
        const bar = document.createElement("span");
        bar.className = "etiqueta-chip__bar";
        bar.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "etiqueta-chip__name";
        name.textContent = d.name;
        chip.append(bar, name);
        value.appendChild(chip);
      });
    }
  }

  document.querySelectorAll("#equipe-dept-select-list .etiqueta-select__option[data-equipe-dept]").forEach((el) => {
    const id = el.dataset.equipeDept || "";
    const on = equipeDepartamentoIds.includes(id);
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-selected", String(on));
  });

  const clearBtn = document.querySelector("[data-equipe-dept-clear]");
  if (clearBtn) clearBtn.hidden = equipeDepartamentoIds.length === 0;
}

function openEquipeModal(editing = null) {
  equipeModalOpen = true;
  equipeEditing = editing;
  equipePasswordVisible = false;
  equipeDepartamentoIds = editing?.departamentoIds ? [...editing.departamentoIds] : [];
  renderActivePage();
  requestAnimationFrame(() => {
    document.getElementById("equipe-name")?.focus();
  });
}

function closeEquipeModal() {
  equipeModalOpen = false;
  equipeEditing = null;
  equipePasswordVisible = false;
  equipeDepartamentoIds = [];
  renderActivePage();
}

function refreshEquipeList() {
  const list = document.getElementById("equipe-list");
  if (!list) return;
  const page = EquipePage({
    equipes,
    departamentos,
    searchQuery: equipesSearchQuery,
    modalOpen: equipeModalOpen,
    editing: equipeEditing,
    passwordVisible: equipePasswordVisible,
    selectedDepartamentoIds: equipeDepartamentoIds,
  });
  const tmp = document.createElement("div");
  tmp.innerHTML = page;
  const nextList = tmp.querySelector("#equipe-list");
  const nextCount = tmp.querySelector(".chat-window__assignee");
  if (nextList) list.replaceWith(nextList);
  const countEl = document.querySelector("#equipe-page .chat-window__assignee");
  if (countEl && nextCount) countEl.textContent = nextCount.textContent;
}

function leaveConversation() {
  chatLoadToken += 1;
  chatLoading = false;
  activeChat = null;
  chats = chats.map((c) => ({ ...c, active: false }));
  clearPendingAttachments();
  replyTo = null;
  msgSearchOpen = false;
  msgSearchQuery = "";
  mobilePanel = "list";
  closeMessageMenu();
  closeChatMoreMenu();
  render();
}

function fetchChatMessages(_chatId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialMessages.map((m) => ({ ...m })));
    }, 1100);
  });
}

function fetchChatList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = initialChats.map((c) => ({ ...c, active: false }));
      console.log("[mock] chat list", data);
      resolve(data);
    }, 1200);
  });
}

async function loadChatList() {
  listLoading = true;
  render();

  try {
    const data = await fetchChatList();
    chats = data;
    listLoading = false;
    render();
  } catch (err) {
    console.error("[mock] falha ao carregar lista", err);
    chats = [];
    listLoading = false;
    render();
  }
}

function bindChatHeaderMenus() {
  const more = document.getElementById("chat-more");
  const moreBtn = document.getElementById("chat-more-btn");
  const moreMenu = document.getElementById("chat-more-menu");

  moreBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!moreMenu) return;
    const open = moreMenu.hidden;
    moreMenu.hidden = !open;
    more?.classList.toggle("is-open", open);
    moreBtn.setAttribute("aria-expanded", String(open));
  });

  moreMenu?.querySelectorAll("[data-chat-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.chatAction;
      closeChatMoreMenu();
      handleChatAction(action);
    });
  });

  document.getElementById("chat-search-toggle")?.addEventListener("click", () => {
    msgSearchOpen = !msgSearchOpen;
    if (!msgSearchOpen) {
      msgSearchQuery = "";
      clearMessageSearchHighlights();
    }
    render();
    if (msgSearchOpen) {
      queueMicrotask(() => {
        document.getElementById("chat-msg-search-input")?.focus({ preventScroll: true });
      });
    }
  });

  document.getElementById("chat-msg-search-close")?.addEventListener("click", () => {
    msgSearchOpen = false;
    msgSearchQuery = "";
    clearMessageSearchHighlights();
    render();
  });

  const searchInput = document.getElementById("chat-msg-search-input");
  searchInput?.addEventListener("input", () => {
    msgSearchQuery = searchInput.value;
    applyMessageSearch(msgSearchQuery);
  });
}

function closeChatMoreMenu() {
  const more = document.getElementById("chat-more");
  const moreBtn = document.getElementById("chat-more-btn");
  const moreMenu = document.getElementById("chat-more-menu");
  if (!moreMenu || moreMenu.hidden) return;
  moreMenu.hidden = true;
  more?.classList.remove("is-open");
  moreBtn?.setAttribute("aria-expanded", "false");
}

function handleChatAction(action) {
  if (action === "deletar") {
    if (!activeChat) return;
    openConfirmModal({
      title: "Deletar conversa?",
      description: `A conversa com ${activeChat.name} será removida da lista. Essa ação não pode ser desfeita.`,
      confirmText: "Deletar",
      cancelText: "Cancelar",
      danger: true,
      onConfirm: () => deleteCurrentConversation(),
    });
    return;
  }
}

function deleteCurrentConversation() {
  if (!activeChat) return;
  const id = activeChat.id;
  chats = chats.filter((c) => c.id !== id);
  leaveConversation();
}

function applyMessageSearch(query) {
  const q = query.trim().toLowerCase();
  const list = document.getElementById("chat-messages");
  const countEl = document.getElementById("chat-msg-search-count");
  if (!list) return;

  let matches = 0;
  list.querySelectorAll(".message").forEach((msg) => {
    const textEl = msg.querySelector(".message__text");
    const raw = (textEl?.innerText || "").toLowerCase();
    const hit = Boolean(q) && raw.includes(q);
    msg.classList.toggle("is-search-hit", hit);
    msg.classList.toggle("is-search-dim", Boolean(q) && !hit);
    if (hit) matches += 1;
  });

  if (countEl) {
    countEl.textContent = q ? `${matches}` : "";
  }

  if (q && matches) {
    list.querySelector(".message.is-search-hit")?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
}

function clearMessageSearchHighlights() {
  document.querySelectorAll(".message.is-search-hit, .message.is-search-dim").forEach((el) => {
    el.classList.remove("is-search-hit", "is-search-dim");
  });
}

function openConfirmModal({
  title = "Confirmar",
  description = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  onConfirm = null,
} = {}) {
  const modal = document.getElementById("confirm-modal");
  const titleEl = document.getElementById("confirm-modal-title");
  const descEl = document.getElementById("confirm-modal-desc");
  const okBtn = document.getElementById("confirm-modal-ok");
  const cancelBtn = document.getElementById("confirm-modal-cancel");
  if (!modal || !titleEl || !descEl || !okBtn) return;

  titleEl.textContent = title;
  descEl.textContent = description;
  okBtn.textContent = confirmText;
  if (cancelBtn) cancelBtn.textContent = cancelText;
  okBtn.classList.toggle("confirm-modal__btn--danger", danger);
  okBtn.classList.toggle("confirm-modal__btn--primary", !danger);
  confirmOnOk = onConfirm;
  modal.hidden = false;
}

function closeConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  if (!modal) return;
  modal.hidden = true;
  confirmOnOk = null;
}

function bindConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  const okBtn = document.getElementById("confirm-modal-ok");
  if (!modal) return;

  modal.querySelectorAll("[data-confirm-dismiss]").forEach((el) => {
    el.addEventListener("click", () => closeConfirmModal());
  });

  okBtn?.addEventListener("click", () => {
    const fn = confirmOnOk;
    closeConfirmModal();
    fn?.();
  });
}

function getVisibleChats() {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return chats;
  return chats.filter((chat) => {
    const haystack = [chat.name, chat.company, chat.preview, chat.assignee]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function bindSearch() {
  const input = document.getElementById("chat-search");
  if (!input) return;

  input.addEventListener("input", () => {
    searchQuery = input.value;
    refreshChatListItems();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchQuery = "";
      input.value = "";
      refreshChatListItems();
      input.blur();
    }
  });
}

function refreshChatListItems() {
  const list = document.getElementById("chat-list-items");
  if (!list || listLoading) return;
  list.innerHTML = renderChatItems(getVisibleChats());
  bindChatItems();
}

function bindChatItems() {
  if (listLoading) return;
  document.querySelectorAll(".chat-item:not(.chat-item--skeleton)").forEach((item) => {
    item.addEventListener("click", () => selectChat(item.dataset.chatId));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectChat(item.dataset.chatId);
      }
    });
  });
}

function setNavMenuOpen(open) {
  const menu = document.getElementById("nav-menu");
  const btn = document.getElementById("nav-menu-btn");
  const panel = document.getElementById("nav-menu-panel");
  if (!menu || !btn || !panel) return;

  panel.hidden = !open;
  menu.classList.toggle("is-open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  btn.innerHTML = open ? Icons.x : Icons.menu;
}

function bindNavMenu() {
  const btn = document.getElementById("nav-menu-btn");
  if (!btn || btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const panel = document.getElementById("nav-menu-panel");
    if (!panel) return;
    setNavMenuOpen(panel.hidden);
  });
}

function bindComposer() {
  const form = document.getElementById("chat-composer");
  const input = document.getElementById("composer-field");
  const wrap = document.getElementById("chat-composer-wrap");
  const fileInput = document.getElementById("composer-file-input");
  const attachBtn = document.getElementById("composer-attach");
  const dropTarget = document.getElementById("chat-window") || wrap;

  const syncEmpty = () => {
    if (!input) return;
    const empty = !input.innerText.replace(/\u00a0/g, " ").trim();
    input.classList.toggle("is-empty", empty);
  };

  const clearComposerField = () => {
    if (!input) return;
    input.innerHTML = "";
    input.classList.add("is-empty");
    closeComposerSlash();
  };

  const sendMessage = () => {
    const { text, html } = getComposerContent(input);
    const files = [...pendingAttachments];
    if (!text && !files.length) return;

    const baseTime = nowTime();
    const stamp = Date.now();
    const batch = [];

    if (!files.length) {
      batch.push({
        id: String(stamp),
        from: "out",
        text,
        html: html.includes("<") ? html : undefined,
        time: baseTime,
        read: false,
        ...(replyTo ? { replyTo: { ...replyTo } } : {}),
      });
    } else {
      files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        const msg = {
          id: `${stamp}-${index}`,
          from: "out",
          time: baseTime,
          read: false,
        };

        if (file.kind === "image") {
          msg.image = { src: file.src, alt: file.name || "Imagem" };
        } else if (file.kind === "video") {
          msg.video = { src: file.src };
        } else {
          msg.attachment = {
            name: file.name,
            size: file.sizeLabel,
            type: file.ext === "PDF" ? "pdf" : "file",
            url: file.src,
          };
        }

        if (isLast) {
          if (text) {
            msg.text = text;
            msg.html = html.includes("<") ? html : undefined;
          }
          if (replyTo) msg.replyTo = { ...replyTo };
        }

        batch.push(msg);
      });
    }

    messages = [...messages, ...batch];
    pendingAttachments = [];
    replyTo = null;
    clearComposerField();
    batch.forEach((msg) => appendMessage(msg));
    clearComposerPreview();
    clearReplyPreview();
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  input?.addEventListener("keydown", (e) => {
    if (handleComposerSlashKeydown(e, input)) return;

    // Enter e Shift+Enter = nova linha; Ctrl/Cmd+Enter = enviar
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
      return;
    }
    if (e.key === "Enter") {
      // deixa o contenteditable quebrar linha (Enter e Shift+Enter)
      return;
    }
  });

  input?.addEventListener("input", () => {
    syncEmpty();
    updateComposerSlash(input);
  });

  input?.addEventListener("click", () => updateComposerSlash(input));
  input?.addEventListener("blur", () => {
    // delay para permitir click no item do menu
    setTimeout(() => {
      if (!document.activeElement?.closest?.("#composer-slash")) {
        closeComposerSlash();
      }
    }, 120);
  });

  document.getElementById("composer-reply-remove")?.addEventListener("click", () => {
    replyTo = null;
    clearReplyPreview();
  });

  attachBtn?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    if (files.length) addPendingFiles(files);
    fileInput.value = "";
  });

  input?.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }

    if (imageFiles.length) {
      e.preventDefault();
      addPendingFiles(imageFiles);
      input.focus({ preventScroll: true });
      return;
    }

    // cola só texto limpo (evita HTML estranho)
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncEmpty();
    updateComposerSlash(input);
  });

  // Arrastar arquivo / foto para a área do chat
  if (dropTarget && dropTarget.dataset.dndBound !== "1") {
    dropTarget.dataset.dndBound = "1";
    let dragDepth = 0;

    dropTarget.addEventListener("dragenter", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth += 1;
      dropTarget.classList.add("is-drop-target");
    });

    dropTarget.addEventListener("dragleave", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) dropTarget.classList.remove("is-drop-target");
    });

    dropTarget.addEventListener("dragover", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    dropTarget.addEventListener("drop", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth = 0;
      dropTarget.classList.remove("is-drop-target");
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) addPendingFiles(files);
    });
  }
}

let composerSlashIndex = 0;
let composerSlashMatches = [];
let composerSlashQuery = null;

function isComposerSlashOpen() {
  const menu = document.getElementById("composer-slash");
  return Boolean(menu && !menu.hidden);
}

function getComposerSlashState(input) {
  if (!input) return null;
  const sel = window.getSelection();
  if (!sel?.rangeCount || !input.contains(sel.focusNode)) return null;
  const caret = sel.getRangeAt(0);
  if (!caret.collapsed) return null;

  const pre = document.createRange();
  pre.selectNodeContents(input);
  pre.setEnd(caret.endContainer, caret.endOffset);
  const before = pre.toString().replace(/\u00a0/g, " ");

  const match = before.match(/(^|[\s\n])\/([^\s\n]*)$/);
  if (!match) return null;

  return {
    query: match[2].toLowerCase(),
    before,
  };
}

function filterQuickReplies(query) {
  const list = respostasRapidas || [];
  if (!query) return list.slice(0, 8);
  return list
    .filter((r) => (r.shortcut || "").toLowerCase().includes(query))
    .slice(0, 8);
}

function ensureComposerSlashMenu() {
  const wrap = document.getElementById("chat-composer-wrap");
  if (!wrap) return null;
  let menu = document.getElementById("composer-slash");
  if (menu) return menu;

  menu = document.createElement("div");
  menu.id = "composer-slash";
  menu.className = "composer-slash";
  menu.hidden = true;
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", "Respostas rápidas");
  wrap.insertBefore(menu, wrap.querySelector(".chat-composer"));

  menu.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const item = e.target.closest("[data-rr-id]");
    if (!item) return;
    const reply = respostasRapidas.find((r) => r.id === item.dataset.rrId);
    const input = document.getElementById("composer-field");
    if (reply && input) applyComposerSlash(input, reply);
  });

  return menu;
}

function updateComposerSlash(input) {
  const state = getComposerSlashState(input);
  if (!state) {
    closeComposerSlash();
    return;
  }

  const nextMatches = filterQuickReplies(state.query);
  const queryChanged = composerSlashQuery !== state.query;
  composerSlashMatches = nextMatches;
  composerSlashQuery = state.query;

  if (queryChanged) {
    composerSlashIndex = 0;
  } else if (composerSlashMatches.length) {
    composerSlashIndex = Math.min(
      composerSlashIndex,
      composerSlashMatches.length - 1
    );
  } else {
    composerSlashIndex = 0;
  }

  renderComposerSlash();
}

function renderComposerSlash() {
  const menu = ensureComposerSlashMenu();
  if (!menu) return;

  if (!composerSlashMatches.length) {
    menu.innerHTML = `<div class="composer-slash__empty">Nenhuma resposta rápida</div>`;
    menu.hidden = false;
    return;
  }

  menu.innerHTML = composerSlashMatches
    .map((r, i) => {
      const active = i === composerSlashIndex ? "is-active" : "";
      return `
      <button
        type="button"
        class="composer-slash__item ${active}"
        data-rr-id="${escapeAttr(r.id)}"
        role="option"
        aria-selected="${i === composerSlashIndex}"
      >
        <span class="composer-slash__shortcut">/${escapeAttr(r.shortcut)}</span>
        <span class="composer-slash__text">${escapeAttr(r.text)}</span>
      </button>`;
    })
    .join("");
  menu.hidden = false;
  menu.querySelector(".composer-slash__item.is-active")?.scrollIntoView({
    block: "nearest",
  });
}

function closeComposerSlash() {
  const menu = document.getElementById("composer-slash");
  if (menu) menu.hidden = true;
  composerSlashMatches = [];
  composerSlashIndex = 0;
  composerSlashQuery = null;
}

function handleComposerSlashKeydown(e, input) {
  if (!isComposerSlashOpen()) return false;

  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    closeComposerSlash();
    return true;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation();
    if (!composerSlashMatches.length) return true;
    composerSlashIndex = (composerSlashIndex + 1) % composerSlashMatches.length;
    renderComposerSlash();
    return true;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    e.stopPropagation();
    if (!composerSlashMatches.length) return true;
    composerSlashIndex =
      (composerSlashIndex - 1 + composerSlashMatches.length) %
      composerSlashMatches.length;
    renderComposerSlash();
    return true;
  }

  if (e.key === "Enter" || e.key === "Tab") {
    if (!composerSlashMatches.length) {
      closeComposerSlash();
      return e.key === "Tab";
    }
    e.preventDefault();
    e.stopPropagation();
    applyComposerSlash(input, composerSlashMatches[composerSlashIndex]);
    return true;
  }

  return false;
}

function applyComposerSlash(input, reply) {
  const state = getComposerSlashState(input);
  if (!state || !reply) return;

  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const caret = sel.getRangeAt(0);

  const post = document.createRange();
  post.selectNodeContents(input);
  post.setStart(caret.endContainer, caret.endOffset);
  const after = post.toString().replace(/\u00a0/g, " ");

  const newBefore = state.before.replace(/\/[^\s\n]*$/, reply.text);
  input.textContent = newBefore + after;
  placeComposerCaret(input, newBefore.length);
  input.classList.toggle("is-empty", !input.textContent.trim());
  closeComposerSlash();
  input.focus({ preventScroll: true });
}

function placeComposerCaret(el, offset) {
  const range = document.createRange();
  const sel = window.getSelection();
  let remaining = offset;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walk.nextNode();
  while (node) {
    const len = node.textContent.length;
    if (remaining <= len) {
      range.setStart(node, remaining);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    remaining -= len;
    node = walk.nextNode();
  }
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function getComposerContent(el) {
  if (!el) return { text: "", html: "" };
  const text = (el.innerText || "").replace(/\u00a0/g, " ").trim();
  const html = sanitizeMessageHtml(el.innerHTML);
  return { text, html };
}

function sanitizeMessageHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  const allowed = new Set(["BR", "P", "DIV", "SPAN"]);
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowed.has(child.tagName)) {
          child.replaceWith(...child.childNodes);
          return;
        }
        [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
        walk(child);
      }
    });
  };
  walk(tmp);

  return tmp.innerHTML
    .replace(/<div><br><\/div>/gi, "<br>")
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
    .trim();
}

function hasFiles(e) {
  return Array.from(e.dataTransfer?.types || []).includes("Files");
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function addPendingFiles(files) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return;

  const next = list.map((file, i) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const ext = (file.name.split(".").pop() || "FILE").toUpperCase();
    return {
      id: `att-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      kind: isImage ? "image" : isVideo ? "video" : "file",
      src: URL.createObjectURL(file),
      name: file.name || (isImage ? "imagem.png" : "arquivo"),
      type: file.type,
      ext,
      sizeLabel: formatFileSize(file.size),
    };
  });

  pendingAttachments = [...pendingAttachments, ...next];
  showComposerPreview();
}

function removePendingAttachment(id) {
  const item = pendingAttachments.find((a) => a.id === id);
  if (item?.src?.startsWith("blob:")) URL.revokeObjectURL(item.src);
  pendingAttachments = pendingAttachments.filter((a) => a.id !== id);
  if (!pendingAttachments.length) {
    clearComposerPreview();
    return;
  }
  showComposerPreview();
}

function clearPendingAttachments() {
  pendingAttachments.forEach((a) => {
    if (a.src?.startsWith("blob:")) URL.revokeObjectURL(a.src);
  });
  pendingAttachments = [];
}

function appendMessage(msg) {
  const list = document.getElementById("chat-messages");
  if (!list) return;

  const wrap = document.createElement("div");
  wrap.innerHTML = MessageBubble(msg, {
    senderName: activeChat.company
      ? `${activeChat.name} - ${activeChat.company}`
      : activeChat.name,
  }).trim();
  const node = wrap.firstElementChild;
  if (!node) return;

  list.appendChild(node);
  bindLightboxOn(node);
  node.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openMessageMenu(node, e.clientX, e.clientY);
  });
  stickMessagesToEnd(list);
}

function showComposerPreview() {
  const wrap = document.querySelector(".chat-composer-wrap");
  if (!wrap || !pendingAttachments.length) {
    clearComposerPreview();
    return;
  }

  let preview = document.getElementById("composer-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "composer-preview";
    preview.id = "composer-preview";
    const form = wrap.querySelector(".chat-composer");
    wrap.insertBefore(preview, form || wrap.firstElementChild);
  }

  preview.innerHTML = `
    <div class="composer-preview__list">
      ${pendingAttachments
        .map((attachment) => {
          const removeBtn = `
            <button
              type="button"
              class="composer-preview__remove"
              data-preview-remove="${escapeAttr(attachment.id)}"
              aria-label="Remover anexo"
            >${Icons.x}</button>
          `;

          if (attachment.kind === "image") {
            return `
              <div class="composer-preview__item" data-preview-id="${escapeAttr(attachment.id)}">
                <div class="composer-preview__media">
                  <img src="${escapeAttr(attachment.src)}" alt="" />
                </div>
                ${removeBtn}
              </div>
            `;
          }

          if (attachment.kind === "video") {
            return `
              <div class="composer-preview__item" data-preview-id="${escapeAttr(attachment.id)}">
                <div class="composer-preview__media composer-preview__media--video">
                  <video src="${escapeAttr(attachment.src)}" muted></video>
                </div>
                ${removeBtn}
              </div>
            `;
          }

          return `
            <div class="composer-preview__item composer-preview__item--file" data-preview-id="${escapeAttr(attachment.id)}">
              <div class="composer-preview__file">${escapeAttr(attachment.ext || "FILE")}</div>
              <div class="composer-preview__meta">
                <strong>${escapeAttr(attachment.name || "Arquivo")}</strong>
                <span>${escapeAttr(attachment.sizeLabel || "")}</span>
              </div>
              ${removeBtn}
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  wrap.classList.add("has-preview");

  const list = document.getElementById("chat-messages");
  if (list) {
    const nearBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight < 48;
    list.classList.add("has-composer-preview");
    if (nearBottom) list.scrollTop = list.scrollHeight;
  }

  preview.querySelectorAll("[data-preview-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removePendingAttachment(btn.dataset.previewRemove);
    });
  });
}

function clearComposerPreview() {
  document.getElementById("composer-preview")?.remove();
  document.querySelector(".chat-composer-wrap")?.classList.remove("has-preview");
  document.getElementById("chat-messages")?.classList.remove("has-composer-preview");
}

function clearReplyPreview() {
  document.getElementById("composer-reply")?.remove();
  document.querySelector(".chat-composer-wrap")?.classList.remove("has-reply");
  document.getElementById("chat-messages")?.classList.remove("has-composer-reply");
}

function showReplyPreview(reply) {
  const wrap = document.querySelector(".chat-composer-wrap");
  if (!wrap) return;

  let preview = document.getElementById("composer-reply");
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "composer-reply";
    preview.id = "composer-reply";
    wrap.insertBefore(preview, wrap.querySelector(".chat-composer"));
  }

  const text =
    reply.text?.trim() ||
    (reply.image ? "Foto" : "") ||
    (reply.video ? "Vídeo" : "") ||
    reply.attachment?.name ||
    "Mensagem";

  preview.innerHTML = `
    <div class="composer-reply__bar"></div>
    <div class="composer-reply__body">
      <strong>${escapeAttr(reply.author || "Mensagem")}</strong>
      <span>${escapeAttr(text)}</span>
    </div>
    <button type="button" class="composer-reply__remove" id="composer-reply-remove" aria-label="Cancelar resposta">
      ${Icons.x}
    </button>
  `;

  wrap.classList.add("has-reply");
  document.getElementById("chat-messages")?.classList.add("has-composer-reply");

  document.getElementById("composer-reply-remove")?.addEventListener("click", () => {
    replyTo = null;
    clearReplyPreview();
  });

  queueMicrotask(() => {
    document.getElementById("composer-field")?.focus({ preventScroll: true });
  });
}

function bindMessageMenu() {
  const menu = document.getElementById("msg-menu");
  if (!menu) return;

  document.querySelectorAll(".message").forEach((el) => {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openMessageMenu(el, e.clientX, e.clientY);
    });
  });

  menu.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const emoji = btn.dataset.emoji;
      handleMenuAction(action, emoji);
    });
  });
}

function openMessageMenu(messageEl, x, y) {
  const menu = document.getElementById("msg-menu");
  if (!menu) return;

  menuMessageId = messageEl.dataset.messageId;
  const isOut = messageEl.dataset.from === "out";

  // remonta ações (apagar só nas minhas)
  menu.outerHTML = MessageMenu({ canDelete: isOut });
  const next = document.getElementById("msg-menu");
  if (!next) return;

  next.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleMenuAction(btn.dataset.action, btn.dataset.emoji);
    });
  });

  next.hidden = false;
  next.style.left = "0px";
  next.style.top = "0px";

  const rect = next.getBoundingClientRect();
  const pad = 8;
  let left = x;
  let top = y;
  if (left + rect.width > window.innerWidth - pad) {
    left = window.innerWidth - rect.width - pad;
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = window.innerHeight - rect.height - pad;
  }
  next.style.left = `${Math.max(pad, left)}px`;
  next.style.top = `${Math.max(pad, top)}px`;
}

function closeMessageMenu() {
  const menu = document.getElementById("msg-menu");
  if (!menu) return;
  menu.hidden = true;
  menuMessageId = null;
}

document.addEventListener(
  "scroll",
  () => {
    const menu = document.getElementById("msg-menu");
    if (menu && !menu.hidden) closeMessageMenu();
  },
  true
);

function handleMenuAction(action, emoji) {
  const msg = messages.find((m) => m.id === menuMessageId);
  if (!msg) {
    closeMessageMenu();
    return;
  }

  if (action === "reply") {
    replyTo = buildReplyPayload(msg);
    closeMessageMenu();
    showReplyPreview(replyTo);
    return;
  }

  if (action === "delete" && msg.from === "out") {
    messages = messages.filter((m) => m.id !== msg.id);
    document.querySelector(`[data-message-id="${msg.id}"]`)?.remove();
    closeMessageMenu();
    return;
  }

  if (action === "react" && emoji) {
    addReaction(msg.id, emoji);
    closeMessageMenu();
  }
}

function addReaction(messageId, emoji) {
  messages = messages.map((m) => {
    if (m.id !== messageId) return m;
    const reactions = [...(m.reactions || [])];
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) existing.count += 1;
    else reactions.push({ emoji, count: 1 });
    return { ...m, reactions };
  });

  const el = document.querySelector(`[data-message-id="${messageId}"]`);
  const updated = messages.find((m) => m.id === messageId);
  if (!el || !updated) return;

  const wrap = document.createElement("div");
  wrap.innerHTML = MessageBubble(updated, {
    senderName: activeChat.company
      ? `${activeChat.name} - ${activeChat.company}`
      : activeChat.name,
  }).trim();
  const node = wrap.firstElementChild;
  if (!node) return;
  el.replaceWith(node);
  bindLightboxOn(node);
  node.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openMessageMenu(node, e.clientX, e.clientY);
  });
}

function bindLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");

  const close = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (img) img.src = "";
  };

  closeBtn?.addEventListener("click", close);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  bindLightboxOn(document);
}

function bindLightboxOn(root) {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  if (!lightbox || !img) return;

  root.querySelectorAll?.("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      img.src = btn.dataset.lightbox;
      lightbox.hidden = false;
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeMessageMenu();
  closeChatMoreMenu();
  const confirm = document.getElementById("confirm-modal");
  if (confirm && !confirm.hidden) {
    closeConfirmModal();
    return;
  }
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  const img = document.getElementById("lightbox-img");
  if (img) img.src = "";
});

function bindThemePicker() {
  const picker = document.getElementById("theme-picker");
  const btn = document.getElementById("theme-picker-btn");
  const menu = document.getElementById("theme-picker-menu");
  if (!picker || !btn || !menu) return;

  const close = () => {
    menu.hidden = true;
    picker.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    menu.hidden = false;
    picker.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.hidden) open();
    else close();
  });

  menu.querySelectorAll(".theme-picker__swatch").forEach((swatch) => {
    swatch.addEventListener("click", (e) => {
      e.stopPropagation();
      themeId = swatch.dataset.themeId;
      applyTheme(themeId);

      menu.querySelectorAll(".theme-picker__swatch").forEach((s) => {
        const active = s.dataset.themeId === themeId;
        s.classList.toggle("is-active", active);
        s.setAttribute("aria-checked", String(active));
      });
    });
  });
}

document.addEventListener("click", (e) => {
  const picker = document.getElementById("theme-picker");
  const menu = document.getElementById("theme-picker-menu");
  const btn = document.getElementById("theme-picker-btn");
  if (picker && menu && !menu.hidden && !picker.contains(e.target)) {
    menu.hidden = true;
    picker.classList.remove("is-open");
    btn?.setAttribute("aria-expanded", "false");
  }

  const navMenu = document.getElementById("nav-menu");
  const navPanel = document.getElementById("nav-menu-panel");
  if (navMenu && navPanel && !navPanel.hidden && !navMenu.contains(e.target)) {
    setNavMenuOpen(false);
  }

  const msgMenu = document.getElementById("msg-menu");
  if (msgMenu && !msgMenu.hidden && !msgMenu.contains(e.target)) {
    closeMessageMenu();
  }

  const chatMore = document.getElementById("chat-more");
  if (chatMore && !chatMore.contains(e.target)) {
    closeChatMoreMenu();
  }
});

async function selectChat(id) {
  const selected = chats.find((c) => c.id === id);
  if (!selected) return;

  const person = contacts.find((c) => c.id === selected.contactId) || null;
  const token = ++chatLoadToken;
  chats = chats.map((c) => ({ ...c, active: c.id === id }));
  activeChat = null;
  messages = [];
  clearPendingAttachments();
  replyTo = null;
  msgSearchOpen = false;
  msgSearchQuery = "";
  chatLoading = true;
  mobilePanel = "chat";
  render();

  try {
    const nextMessages = await fetchChatMessages(id);
    if (token !== chatLoadToken) return;

    activeChat = {
      id: selected.id,
      contactId: selected.contactId,
      ticketId: selected.ticketId,
      name: person?.name || selected.name,
      company: person?.company || selected.company,
      avatar: person?.avatar || selected.avatar,
      online: !!(person?.online ?? selected.online),
      assignee: selected.assignee,
      color: selected.color || person?.color,
      tag: selected.tag || person?.tag || null,
      tags: person?.tags || (selected.tag ? [selected.tag] : []),
    };
    messages = nextMessages;
    chatLoading = false;
    render({ scrollToEnd: true });
  } catch {
    if (token !== chatLoadToken) return;
    chatLoading = false;
    activeChat = null;
    render();
  }
}

window.addEventListener("chat-list-resized", () => {
  filtersEmbla?.reInit();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800 && mobilePanel !== "chat") {
    mobilePanel = "chat";
  }
});

render({ scrollToEnd: true });
if (isAuthenticated) loadChatList();
