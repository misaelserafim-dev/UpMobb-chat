import { useState } from "react";
import { SYSTEM_COLORS } from "@/utils/theme.ts";
import {
  RADIUS_TEMPLATES,
  applyTemplate,
  getSavedTemplateId,
  type RadiusTemplateId,
} from "@/utils/template.ts";
import type { ThemePickerMenuProps } from "./ThemePickerMenu.ts";
import "./ThemePickerMenu.css";

function TemplateIcon({ kind }: { kind: RadiusTemplateId }) {
  if (kind === "rounded") {
    return (
      <svg className="theme-picker__template-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="6"
          ry="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M4 11 V8 Q4 4 8 4 H11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className="theme-picker__template-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="1.5"
        ry="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M4 11 V4 H11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function ThemePickerMenu({
  open = false,
  themeId = "upmobb",
  colors = SYSTEM_COLORS,
  onSelect,
}: ThemePickerMenuProps) {
  const [templateId, setTemplateId] = useState(getSavedTemplateId);

  if (!open) return null;

  return (
    <div className="theme-picker__menu" role="menu">
      <div className="theme-picker__title">Cores do sistema</div>
      <div className="theme-picker__swatches">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            className={`theme-picker__swatch${color.swatchImage ? " theme-picker__swatch--icon" : ""}${
              color.id === themeId ? " is-active" : ""
            }`}
            style={{ ["--swatch" as string]: color.background }}
            title={color.label}
            aria-label={color.label}
            role="menuitemradio"
            aria-checked={color.id === themeId}
            onClick={() => onSelect?.(color.id)}
          >
            {color.swatchImage ? (
              <img className="theme-picker__swatch-icon" src={color.swatchImage} alt="" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="theme-picker__title theme-picker__title--spaced">Template</div>
      <div className="theme-picker__templates" role="group" aria-label="Template de cantos">
        {RADIUS_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`theme-picker__template theme-picker__template--${template.id}${
              template.id === templateId ? " is-active" : ""
            }`}
            title={template.label}
            aria-label={template.label}
            role="menuitemradio"
            aria-checked={template.id === templateId}
            onClick={() => {
              applyTemplate(template.id);
              setTemplateId(template.id);
            }}
          >
            <TemplateIcon kind={template.id} />
          </button>
        ))}
      </div>
    </div>
  );
}
