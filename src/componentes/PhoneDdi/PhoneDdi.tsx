import { useMemo, useRef, useState } from "react";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useDismissable } from "@/hooks/useDismissable.ts";
import { DIAL_CODES, getDialCode } from "@/utils/dialCodes.ts";
import type { PhoneDdiProps } from "./PhoneDdi.ts";
import "./PhoneDdi.css";

export function PhoneDdi({
  value,
  onChange,
  id = "phone-ddi",
  className = "",
}: PhoneDdiProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => getDialCode("+55", value), [value]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DIAL_CODES;
    return DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  function setOpenSafe(next: boolean) {
    setOpen(next);
    if (!next) setSearch("");
  }

  useDismissable({
    open,
    onDismiss: () => setOpenSafe(false),
    refs: [rootRef],
  });

  return (
    <div
      ref={rootRef}
      id={id}
      className={["phone-ddi", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className="phone-ddi__trigger"
        id={`${id}-btn`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpenSafe(!open)}
      >
        <span className="phone-ddi__flag">{selected.flag}</span>
        <span className="phone-ddi__chevron" aria-hidden="true">
          <Icons.ChevronDown />
        </span>
        <span className="phone-ddi__code">{selected.dial}</span>
      </button>

      {open ? (
        <div className="phone-ddi__menu" role="listbox">
          <input
            type="search"
            className="phone-ddi__search"
            placeholder="search"
            aria-label="Buscar país"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="phone-ddi__list">
            {filtered.map((c) => (
              <button
                key={`${c.iso}-${c.dial}`}
                type="button"
                className={`phone-ddi__option${c.iso === selected.iso ? " is-active" : ""}`}
                role="option"
                aria-selected={c.iso === selected.iso}
                onClick={() => {
                  onChange(c);
                  setOpenSafe(false);
                }}
              >
                <span className="phone-ddi__flag">{c.flag}</span>
                <span className="phone-ddi__name">{c.name}</span>
                <span className="phone-ddi__dial">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
