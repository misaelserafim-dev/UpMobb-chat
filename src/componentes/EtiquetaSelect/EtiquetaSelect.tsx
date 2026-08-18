import { useMemo, useRef, useState } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import type { EtiquetaSelectProps } from "./EtiquetaSelect.ts";
import "./EtiquetaSelect.css";

export function EtiquetaSelect({
  items,
  value,
  onChange,
  id,
  placeholder = "Selecionar",
  searchPlaceholder = "Pesquisar",
  emptyMessage = "Nenhum item cadastrado.",
  menuPlacement = "below",
  onOpenChange,
  className = "",
}: EtiquetaSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  function setOpenSafe(next: boolean) {
    setOpen(next);
    if (!next) setSearch("");
    onOpenChange?.(next);
  }

  useDismissable({
    open,
    onDismiss: () => setOpenSafe(false),
    refs: [rootRef],
  });

  const selected = useMemo(
    () => items.filter((item) => value.includes(item.id)),
    [items, value],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  function toggleOpen() {
    setOpenSafe(!open);
  }

  function toggleId(itemId: string) {
    onChange(
      value.includes(itemId) ? value.filter((id) => id !== itemId) : [...value, itemId],
    );
  }

  function removeId(itemId: string) {
    onChange(value.filter((id) => id !== itemId));
  }

  if (!items.length) {
    return <p className="contact-etiqueta-picker__empty">{emptyMessage}</p>;
  }

  return (
    <div
      ref={rootRef}
      id={id}
      className={["etiqueta-select", className].filter(Boolean).join(" ")}
    >
      <div
        className="etiqueta-select__trigger"
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
      >
        <span className="etiqueta-select__value">
          {selected.length === 0 ? (
            <span className="etiqueta-select__placeholder">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item.id}
                className="etiqueta-chip etiqueta-select__chip"
                style={{ ["--etiqueta-color" as string]: item.color }}
              >
                <span className="etiqueta-chip__bar" aria-hidden="true" />
                <span className="etiqueta-chip__name">{item.name}</span>
                <button
                  type="button"
                  className="etiqueta-select__chip-remove"
                  aria-label={`Remover ${item.name}`}
                  title="Remover"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeId(item.id);
                  }}
                >
                  <Icons.X />
                </button>
              </span>
            ))
          )}
        </span>
        <span className="etiqueta-select__chevron" aria-hidden="true">
          <Icons.ChevronDown />
        </span>
      </div>

      {open ? (
        <div
          className={`etiqueta-select__menu${
            menuPlacement === "above" ? " etiqueta-select__menu--above" : ""
          }`}
          role="listbox"
          aria-multiselectable="true"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="search"
            className="etiqueta-select__search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="etiqueta-select__clear"
            hidden={value.length === 0}
            onClick={() => onChange([])}
          >
            Limpar seleção
          </button>
          <div className="etiqueta-select__list">
            {filtered.map((item) => {
              const on = value.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`etiqueta-select__option${on ? " is-active" : ""}`}
                  role="option"
                  aria-selected={on}
                  onClick={() => toggleId(item.id)}
                >
                  <span className="etiqueta-select__check" aria-hidden="true" />
                  <span
                    className="etiqueta-chip"
                    style={{ ["--etiqueta-color" as string]: item.color }}
                  >
                    <span className="etiqueta-chip__bar" aria-hidden="true" />
                    <span className="etiqueta-chip__name">{item.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
