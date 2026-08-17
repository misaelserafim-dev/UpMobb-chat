export type ThemeColor = {
  id: string;
  label: string;
  background: string;
  color: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentHoverText?: string;
  bubbleIn: string;
  swatchImage?: string;
};

export const THEME_STORAGE_KEY = "app-theme-color";
export const DEFAULT_THEME_ID = "default";

const UPMOBB_SWATCH = new URL("../assets/ico_pwa.png", import.meta.url).href;

export const SYSTEM_COLORS: ThemeColor[] = [
  {
    id: "upmobb",
    label: "UpMobb",
    background: "#0063a3",
    color: "#FFFFFF",
    accent: "#217cbb",
    accentHover: "#1c6ca3",
    accentText: "#FFFFFF",
    bubbleIn: "#f7f8fa",
    swatchImage: UPMOBB_SWATCH,
  },
  {
    id: "default",
    label: "Padrão",
    background: "#e8e8ec",
    color: "#1F2937",
    accent: "#0063a3",
    accentHover: "#00528a",
    accentText: "#FFFFFF",
    bubbleIn: "#f7f8fa",
  },
  {
    id: "blue-light",
    label: "Azul claro",
    background: "#B8CAD7",
    color: "#1F2937",
    accent: "#5B88A8",
    accentHover: "#4D7695",
    accentText: "#FFFFFF",
    bubbleIn: "#f5f7f9",
  },
  {
    id: "blue",
    label: "Azul",
    background: "#7BAECC",
    color: "#1F2937",
    accent: "#3F7FA7",
    accentHover: "#346D90",
    accentText: "#FFFFFF",
    bubbleIn: "#f5f8fb",
  },
  {
    id: "red",
    label: "Vermelho",
    background: "#D8B6B6",
    color: "#1F2937",
    accent: "#A86B6B",
    accentHover: "#945A5A",
    accentText: "#FFFFFF",
    bubbleIn: "#faf7f7",
  },
  {
    id: "gray",
    label: "Cinza",
    background: "#A9ADB3",
    color: "#1F2937",
    accent: "#5F6873",
    accentHover: "#505861",
    accentText: "#FFFFFF",
    bubbleIn: "#f7f7f8",
  },
  {
    id: "purple",
    label: "Roxo",
    background: "#BDA5CC",
    color: "#1F2937",
    accent: "#7C6795",
    accentHover: "#6D5984",
    accentText: "#FFFFFF",
    bubbleIn: "#f8f6fa",
  },
  {
    id: "cyan",
    label: "Ciano",
    background: "#79BDBA",
    color: "#1F2937",
    accent: "#3F7E7A",
    accentHover: "#346C69",
    accentText: "#FFFFFF",
    bubbleIn: "#f5f9f9",
  },
  {
    id: "green",
    label: "Verde",
    background: "#3F7774",
    color: "#FFFFFF",
    accent: "#6FB5B2",
    accentHover: "#5CA29F",
    accentText: "#1F2937",
    bubbleIn: "#f5f8f8",
  },
  {
    id: "navy",
    label: "Navy",
    background: "#42637D",
    color: "#FFFFFF",
    accent: "#7EA6C6",
    accentHover: "#6D95B6",
    accentText: "#1F2937",
    bubbleIn: "#f5f7f9",
  },
  {
    id: "background",
    label: "Grafite",
    background: "#2D3035",
    color: "#FFFFFF",
    accent: "#111111",
    accentHover: "#000000",
    accentText: "#FFFFFF",
    bubbleIn: "#f7f7f8",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    background: "#f5e9d8",
    color: "#1D1F1F",
    accent: "#1DAA61",
    accentHover: "#169352",
    accentText: "#FFFFFF",
    accentHoverText: "#FFFFFF",
    bubbleIn: "#ffffff",
  },
  {
    id: "sand",
    label: "Areia",
    background: "#ebcda1",
    color: "#1F2937",
    accent: "#8E7358",
    accentHover: "#795F46",
    accentText: "#FFFFFF",
    bubbleIn: "#faf8f5",
  },
];

export function getSavedThemeId(): string {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function getThemeById(id: string): ThemeColor {
  return SYSTEM_COLORS.find((c) => c.id === id) || SYSTEM_COLORS[0];
}

export function applyTheme(id: string): ThemeColor {
  const theme = getThemeById(id);
  const root = document.documentElement.style;

  root.setProperty("--app-bg", theme.background);
  root.setProperty("--shell-bg", theme.background);
  root.setProperty("--accent", theme.accent);
  root.setProperty("--accent-hover", theme.accentHover);
  root.setProperty("--accent-text", theme.accentText);
  root.setProperty("--accent-hover-text", theme.accentHoverText || theme.accentText);
  root.setProperty("--bubble-in", "#ffffff");
  root.setProperty("--bubble-out", theme.background);
  root.setProperty("--bubble-out-text", theme.color || "#1F2937");

  document.documentElement.dataset.theme = theme.id;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch {
    // ignore
  }

  return theme;
}
