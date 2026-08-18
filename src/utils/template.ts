export type RadiusTemplateId = "rounded" | "square";

export type RadiusTemplate = {
  id: RadiusTemplateId;
  label: string;
  radius: string;
  radiusFull: string;
};

export const TEMPLATE_STORAGE_KEY = "app-radius-template";
export const DEFAULT_TEMPLATE_ID: RadiusTemplateId = "square";

export const RADIUS_TEMPLATES: RadiusTemplate[] = [
  {
    id: "square",
    label: "Cantos retos",
    radius: "4px",
    radiusFull: "4px",
  },
  {
    id: "rounded",
    label: "Cantos redondos",
    radius: "20px",
    radiusFull: "999px",
  },
];

export function getSavedTemplateId(): RadiusTemplateId {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw === "rounded" || raw === "square") return raw;
  } catch {
    // ignore
  }
  return DEFAULT_TEMPLATE_ID;
}

export function getTemplateById(id: string): RadiusTemplate {
  return RADIUS_TEMPLATES.find((t) => t.id === id) || RADIUS_TEMPLATES[0];
}

export function applyTemplate(id: string): RadiusTemplate {
  const template = getTemplateById(id);
  const root = document.documentElement.style;

  root.setProperty("--radius", template.radius);
  root.setProperty("--radius-full", template.radiusFull);
  // --radius-default fica fixo em 4px no CSS

  document.documentElement.dataset.template = template.id;

  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, template.id);
  } catch {
    // ignore
  }

  return template;
}
