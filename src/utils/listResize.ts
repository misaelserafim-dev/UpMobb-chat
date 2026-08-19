const STORAGE_KEY = "chat-list-width-v3";

export const LIST_WIDTH_MIN = 280;
export const LIST_WIDTH_MAX = 640;
export const LIST_WIDTH_DEFAULT = 520;

/** Constante do rubber-band (maior = mais “duro”). */
const ELASTIC_K = 58;

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

/**
 * Largura visual com elastico além do min/max (estilo iOS / Elastic Div).
 * Dentro dos limites = linear; fora = resistência crescente.
 */
export function elasticListWidth(raw: number) {
  if (raw > LIST_WIDTH_MAX) {
    const over = raw - LIST_WIDTH_MAX;
    return LIST_WIDTH_MAX + (over * ELASTIC_K) / (ELASTIC_K + over);
  }
  if (raw < LIST_WIDTH_MIN) {
    const over = LIST_WIDTH_MIN - raw;
    return LIST_WIDTH_MIN - (over * ELASTIC_K) / (ELASTIC_K + over);
  }
  return raw;
}

export function applyListWidth(px: number, opts?: { elastic?: boolean }) {
  const width = opts?.elastic ? elasticListWidth(px) : clampListWidth(px);
  document.documentElement.style.setProperty("--list-w", `${width}px`);
  return width;
}

export function readListWidth() {
  const n = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--list-w"),
  );
  return Number.isFinite(n) ? n : LIST_WIDTH_DEFAULT;
}

export type ListMorphDrag = {
  sx: number;
  sy: number;
  margin: number;
};

export function getListMorphDrag(dx: number, rawWidth?: number): ListMorphDrag {
  const expanding = dx >= 0;
  // Ramp mais suave — evita esticar demais / “embassar”
  const intensity = Math.min(1, Math.abs(dx) / 200);

  let overshoot = 0;
  if (rawWidth != null) {
    if (rawWidth > LIST_WIDTH_MAX) overshoot = (rawWidth - LIST_WIDTH_MAX) / 100;
    else if (rawWidth < LIST_WIDTH_MIN) overshoot = (LIST_WIDTH_MIN - rawWidth) / 100;
  }
  const e = Math.min(0.75, Math.max(0, overshoot));

  const sx = expanding
    ? 1 + 0.04 * intensity + 0.025 * e
    : 1 + 0.018 * intensity + 0.03 * e;
  const sy = expanding
    ? 1 - 0.045 * intensity - 0.03 * e
    : 1 + 0.022 * intensity + 0.028 * e;

  return {
    sx: roundMorph(sx),
    sy: roundMorph(sy),
    margin: roundMorph(4 + (expanding ? -0.6 * e : 1.8 * intensity + 1.2 * e)),
  };
}

/** Tremor leve na mola (ao soltar) — baseado na velocidade, não no dx total. */
export function getListMorphJiggle(velocity: number): ListMorphDrag {
  const t = Math.max(-1, Math.min(1, velocity / 14));
  return {
    sx: roundMorph(1 + t * 0.03),
    sy: roundMorph(1 - t * 0.036),
    margin: roundMorph(4 - Math.abs(t) * 1.1),
  };
}

function roundMorph(n: number) {
  return Math.round(n * 1000) / 1000;
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

/** Mola amortecida até `to` (pode ultrapassar um pouco → bounce). Sem lib. */
export function springListWidth(
  from: number,
  to: number,
  onFrame: (x: number, v: number) => void,
  onDone: () => void,
  opts?: { initialVelocity?: number; stiffness?: number; damping?: number },
) {
  let x = from;
  let v = opts?.initialVelocity ?? 0;
  const stiffness = opts?.stiffness ?? 0.22;
  const damping = opts?.damping ?? 0.68;
  let raf = 0;

  const tick = () => {
    const force = (to - x) * stiffness;
    v = (v + force) * damping;
    x += v;
    onFrame(x, v);
    if (Math.abs(to - x) < 0.3 && Math.abs(v) < 0.3) {
      onFrame(to, 0);
      onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
