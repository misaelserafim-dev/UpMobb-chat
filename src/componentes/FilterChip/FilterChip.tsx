import { Icons } from "../Icons/Icons.tsx";
import type { FilterChipProps } from "./FilterChip.ts";
import "./FilterChip.css";

export function FilterChip({
  id,
  label,
  count,
  dropdown = false,
  active = false,
  wrapSlide = true,
  onClick,
}: FilterChipProps) {
  const chip = (
    <button
      type="button"
      className={`filter-chip${active ? " filter-chip--active" : ""}`}
      data-filter={id}
      onClick={onClick}
    >
      <span className="filter-chip__label">{label}</span>
      {count != null ? <span className="filter-chip__count">{count}</span> : null}
      {dropdown ? (
        <span className="filter-chip__chevron" aria-hidden="true">
          <Icons.ChevronDown />
        </span>
      ) : null}
    </button>
  );

  if (!wrapSlide) return chip;
  return <div className="embla__slide">{chip}</div>;
}
