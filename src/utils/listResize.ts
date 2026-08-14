const STORAGE_KEY = "chat-list-width-v3";

export const LIST_WIDTH_MIN = 280;
export const LIST_WIDTH_MAX = 640;
export const LIST_WIDTH_DEFAULT = 520;

export function clampListWidth(n: number) {
  return Math.min(LIST_WIDTH_MAX, Math.max(LIST_WIDTH_MIN, n));
}

export function getSavedListWidth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return LIST_WIDTH_DEFAULT;
    const n = Number(raw);
    if (!Number.isFinite(n)) return LIST_WIDTH_DEFAULT;
    return clampListWidth(n);
  } catch {
    return LIST_WIDTH_DEFAULT;
  }
}

export function saveListWidth(px: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(clampListWidth(px)));
  } catch {
    // ignore
  }
}

export function applyListWidth(px: number) {
  const width = clampListWidth(px);
  document.documentElement.style.setProperty("--list-w", `${width}px`);
  return width;
}

export type ListMorphDrag = {
  sx: number;
  sy: number;
  margin: number;
};

export function getListMorphDrag(dx: number): ListMorphDrag {
  const expanding = dx >= 0;
  const intensity = Math.min(1, Math.abs(dx) / 140);
  return {
    sx: expanding ? 1 + 0.1 * intensity : 1 + 0.025 * intensity,
    sy: expanding ? 1 - 0.12 * intensity : 1 + 0.035 * intensity,
    margin: expanding ? 4 : 4 + 5 * intensity,
  };
}

export function applyListMorphDrag(list: HTMLElement, drag: ListMorphDrag) {
  list.style.setProperty("--morph-sx", String(drag.sx));
  list.style.setProperty("--morph-sy", String(drag.sy));
  list.style.setProperty("--morph-m", `${drag.margin}px`);
}

export function clearListMorphDrag(list: HTMLElement) {
  list.style.removeProperty("--morph-sx");
  list.style.removeProperty("--morph-sy");
  list.style.removeProperty("--morph-m");
}
