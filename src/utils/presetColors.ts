export type PresetColor = {
  id: string;
  label: string;
  value: string;
};

/** 15 cores pré-definidas para etiquetas */
export const ETIQUETA_COLORS: PresetColor[] = [
  { id: "blue", label: "Azul", value: "#2563eb" },
  { id: "sky", label: "Céu", value: "#0ea5e9" },
  { id: "teal", label: "Turquesa", value: "#14b8a6" },
  { id: "green", label: "Verde", value: "#16a34a" },
  { id: "lime", label: "Lima", value: "#65a30d" },
  { id: "yellow", label: "Amarelo", value: "#ca8a04" },
  { id: "orange", label: "Laranja", value: "#ea580c" },
  { id: "red", label: "Vermelho", value: "#dc2626" },
  { id: "rose", label: "Rosa", value: "#e11d48" },
  { id: "pink", label: "Pink", value: "#db2777" },
  { id: "purple", label: "Roxo", value: "#9333ea" },
  { id: "violet", label: "Violeta", value: "#7c3aed" },
  { id: "indigo", label: "Índigo", value: "#4f46e5" },
  { id: "slate", label: "Cinza", value: "#64748b" },
  { id: "brown", label: "Marrom", value: "#92400e" },
];

/** 8 cores pré-definidas para departamentos */
export const DEPARTAMENTO_COLORS: PresetColor[] = [
  { id: "blue", label: "Azul", value: "#0063a3" },
  { id: "green", label: "Verde", value: "#16a34a" },
  { id: "amber", label: "Âmbar", value: "#d97706" },
  { id: "red", label: "Vermelho", value: "#dc2626" },
  { id: "purple", label: "Roxo", value: "#7c3aed" },
  { id: "teal", label: "Turquesa", value: "#0d9488" },
  { id: "pink", label: "Rosa", value: "#db2777" },
  { id: "slate", label: "Cinza", value: "#475569" },
];

export const DEFAULT_ETIQUETA_COLOR = ETIQUETA_COLORS[0].value;
export const DEFAULT_DEPARTAMENTO_COLOR = DEPARTAMENTO_COLORS[0].value;

function normalizeHex(hex: string) {
  const raw = hex.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
  if (/^#[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  return raw;
}

function hexDistance(a: string, b: string) {
  const na = normalizeHex(a).slice(1);
  const nb = normalizeHex(b).slice(1);
  if (na.length !== 6 || nb.length !== 6) return Number.POSITIVE_INFINITY;
  const ar = parseInt(na.slice(0, 2), 16);
  const ag = parseInt(na.slice(2, 4), 16);
  const ab = parseInt(na.slice(4, 6), 16);
  const br = parseInt(nb.slice(0, 2), 16);
  const bg = parseInt(nb.slice(2, 4), 16);
  const bb = parseInt(nb.slice(4, 6), 16);
  return (ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2;
}

/** Cor exata da lista ou a mais próxima (edição de itens antigos). */
export function resolvePresetColor(color: string | undefined, presets: PresetColor[]): string {
  if (!presets.length) return "#64748b";
  if (!color) return presets[0].value;

  const normalized = normalizeHex(color);
  const exact = presets.find((p) => normalizeHex(p.value) === normalized);
  if (exact) return exact.value;

  let best = presets[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const preset of presets) {
    const dist = hexDistance(normalized, preset.value);
    if (dist < bestDist) {
      best = preset;
      bestDist = dist;
    }
  }
  return best.value;
}
