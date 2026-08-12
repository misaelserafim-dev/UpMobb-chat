import { Icons } from "../icons.js";
import { escapeHtml, escapeAttr } from "../utils/escape.js";

/**
 * Chip de filtro da lista de conversas
 */
export function FilterChip({
  id,
  label,
  count = 0,
  dropdown = false,
  active = false,
  wrapSlide = true,
} = {}) {
  const chip = `
    <button
      type="button"
      class="filter-chip ${active ? "filter-chip--active" : ""}"
      data-filter="${escapeAttr(id)}"
    >
      <span class="filter-chip__label">${escapeHtml(label)}</span>
      <span class="filter-chip__count">${escapeHtml(String(count))}</span>
      ${
        dropdown
          ? `<span class="filter-chip__chevron" aria-hidden="true">${Icons.chevronDown}</span>`
          : ""
      }
    </button>
  `;

  if (!wrapSlide) return chip;

  return `
    <div class="embla__slide">
      ${chip}
    </div>
  `;
}
