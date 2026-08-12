import type { NavLinkProps } from "./NavLink.ts";
import "./NavLink.css";

export function NavLink({ id, label, active = false, href, onClick }: NavLinkProps) {
  const to = href || `#${id}`;

  return (
    <a
      href={to}
      className={`top-nav__link${active ? " top-nav__link--active" : ""}`}
      data-nav={id}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {label}
    </a>
  );
}
