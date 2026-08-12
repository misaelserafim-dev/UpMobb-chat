import { Icons } from "../Icons/Icons.tsx";
import type { FilterChipProps } from "./FilterChip.ts";
import "./FilterChip.css";

export function FilterChip({
  id,
  label,
  count = 0,
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
      <span className="filter-chip__count">{count}</span>
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
