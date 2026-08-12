import { SYSTEM_COLORS } from "@/utils/theme.ts";
import type { ThemePickerMenuProps } from "./ThemePickerMenu.ts";
import "./ThemePickerMenu.css";

export function ThemePickerMenu({
  open = false,
  themeId = "upmobb",
  colors = SYSTEM_COLORS,
  onSelect,
}: ThemePickerMenuProps) {
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
    </div>
  );
}
