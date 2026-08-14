import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Icons } from "../Icons/Icons.tsx";
import type { AddButtonProps } from "./AddButton.ts";
import "./AddButton.css";

const MAGNET_STRENGTH = 0.22;
const MAGNET_MAX = 8;

export function AddButton({
  id,
  label = "Adicionar",
  title,
  className = "",
  type = "button",
  magnetic = true,
  onClick,
}: AddButtonProps) {
  const tip = title || label;
  const classes = ["add-btn", className].filter(Boolean).join(" ");
  const magnetRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!magnetic) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = magnetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setOffset({
      x: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * MAGNET_STRENGTH)),
      y: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * MAGNET_STRENGTH)),
    });
  }

  function handleLeave() {
    setOffset({ x: 0, y: 0 });
  }

  const button = (
    <button type={type} id={id} className={classes} aria-label={label} title={tip} onClick={onClick}>
      <Icons.Plus />
    </button>
  );

  if (!magnetic) return button;

  return (
    <div
      className="add-btn-magnet"
      ref={magnetRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        className="add-btn-magnet__inner"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        {button}
      </div>
    </div>
  );
}
