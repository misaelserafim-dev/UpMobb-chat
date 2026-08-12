import { escapeHtml, escapeAttr } from "../utils/escape.js";

/**
 * Link da top nav (pill / hamburger)
 */
export function NavLink({ id, label, active = false, href } = {}) {
  const to = href || `#${id}`;
  return `
    <a
      href="${escapeAttr(to)}"
      class="top-nav__link ${active ? "top-nav__link--active" : ""}"
      data-nav="${escapeAttr(id)}"
    >${escapeHtml(label)}</a>
  `;
}
