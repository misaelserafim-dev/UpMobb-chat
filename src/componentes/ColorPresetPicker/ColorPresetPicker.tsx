import { useRef, useState } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import type { PresetColor } from "@/utils/presetColors.ts";
import "./ColorPresetPicker.css";

export type ColorPresetPickerProps = {
  colors: PresetColor[];
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
  columns?: number;
};

export function ColorPresetPicker({
  colors,
  value,
  onChange,
  label = "Cor",
  disabled = false,
  columns = 5,
}: ColorPresetPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = colors.find((c) => c.value.toLowerCase() === value.toLowerCase()) || colors[0];

  useDismissable({
    open,
    onDismiss: () => setOpen(false),
    refs: [rootRef],
  });

  return (
    <div className={`color-preset${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="color-preset__trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={selected?.label || label}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="color-preset__swatch"
          style={{ background: value }}
          aria-hidden="true"
        />
        <span className="color-preset__chevron" aria-hidden="true">
          <Icons.ChevronDown />
        </span>
      </button>

      {open ? (
        <div
          className="color-preset__menu"
          role="listbox"
          aria-label={label}
          style={{ gridTemplateColumns: `repeat(${columns}, 28px)` }}
        >
          {colors.map((color) => {
            const active = color.value.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={color.id}
                type="button"
                className={`color-preset__option${active ? " is-active" : ""}`}
                role="option"
                aria-selected={active}
                title={color.label}
                aria-label={color.label}
                style={{ ["--swatch" as string]: color.value }}
                onClick={() => {
                  onChange(color.value);
                  setOpen(false);
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

