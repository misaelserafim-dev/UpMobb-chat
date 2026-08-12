/**
 * Redimensiona a lista de conversas e persiste em localStorage.
 * Deforma .chat-item durante o arraste: estica ao aumentar, incha ao encolher.
 */
const STORAGE_KEY = "chat-list-width-v3";
const MIN = 280;
const MAX = 640;
const DEFAULT = 520;

export function getSavedListWidth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw == null || raw === "") return DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT;
  return clamp(n, MIN, MAX);
}

export function applyListWidth(px) {
  const width = clamp(px, MIN, MAX);
  document.documentElement.style.setProperty("--list-w", `${width}px`);
  return width;
}

export function initListResize(root = document) {
  const handle = root.querySelector("#list-resize-handle");
  const list = root.querySelector(".chat-list");
  if (!handle || !list) return;

  applyListWidth(getSavedListWidth());

  let startX = 0;
  let startW = 0;
  let settleTimer = 0;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getItems = () => list.querySelectorAll(".chat-item:not(.chat-item--active)");

  const morphItems = (dx) => {
    if (reduceMotion) return;
    const items = getItems();
    if (!items.length) return;

    // dx > 0 = aumentando | dx < 0 = encolhendo
    const expanding = dx >= 0;
    const intensity = clamp(Math.abs(dx) / 140, 0, 1);

    const sx = expanding
      ? 1 + 0.1 * intensity // estica
      : 1 + 0.025 * intensity;
    const sy = expanding
      ? 1 - 0.12 * intensity // afina
      : 1 + 0.035 * intensity; // incha leve (sem empilhar)

    items.forEach((item) => {
      item.classList.remove("chat-item--morph-settle");
      item.style.transition = "transform 0.08s linear, margin 0.08s linear";
      item.style.transformOrigin = "left center";
      item.style.transform = `scale(${sx}, ${sy})`;
      // compensar altura extra do inchar pra não sobrepor
      item.style.marginTop = expanding ? "" : `${4 + 5 * intensity}px`;
      item.style.marginBottom = expanding ? "" : `${4 + 5 * intensity}px`;
      item.style.transitionDelay = "";
      item.style.zIndex = "";
    });
  };

  const settleItems = () => {
    if (reduceMotion) return;
    const items = getItems();

    items.forEach((item, i) => {
      item.classList.add("chat-item--morph-settle");
      item.style.transition = "";
      item.style.transitionDelay = `${i * 16}ms`;
      item.style.transform = "scale(1, 1)";
      item.style.marginTop = "";
      item.style.marginBottom = "";
    });

    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      items.forEach((item) => {
        item.classList.remove("chat-item--morph-settle");
        item.style.transform = "";
        item.style.transformOrigin = "";
        item.style.transition = "";
        item.style.transitionDelay = "";
        item.style.marginTop = "";
        item.style.marginBottom = "";
      });
    }, 480 + items.length * 16);
  };

  const onMove = (e) => {
    const dx = e.clientX - startX;
    applyListWidth(startW + dx);
    morphItems(dx);
  };

  const onUp = () => {
    document.body.classList.remove("is-resizing-list");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);

    const current = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--list-w")
    );
    localStorage.setItem(STORAGE_KEY, String(clamp(current, MIN, MAX)));

    settleItems();
    window.dispatchEvent(new CustomEvent("chat-list-resized"));
  };

  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startX = e.clientX;
    startW = list.getBoundingClientRect().width;

    getItems().forEach((item) => {
      item.classList.remove("chat-item--morph-settle");
      item.style.transform = "";
      item.style.transformOrigin = "";
      item.style.transition = "";
      item.style.transitionDelay = "";
      item.style.marginTop = "";
      item.style.marginBottom = "";
    });

    document.body.classList.add("is-resizing-list");
    handle.setPointerCapture?.(e.pointerId);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });

  handle.addEventListener("dblclick", () => {
    const before = list.getBoundingClientRect().width;
    applyListWidth(DEFAULT);
    localStorage.setItem(STORAGE_KEY, String(DEFAULT));
    morphItems(DEFAULT - before);
    settleItems();
    window.dispatchEvent(new CustomEvent("chat-list-resized"));
  });
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
