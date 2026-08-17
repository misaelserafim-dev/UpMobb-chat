import { useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react";

const MAGNET_STRENGTH = 0.22;
const MAGNET_MAX = 8;

export function useMagnetic(enabled = true) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function onMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!enabled) return;
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

  function onMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return {
    magnetRef: magnetRef as RefObject<HTMLDivElement | null>,
    style: { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` },
    magnetProps: {
      onMouseMove,
      onMouseLeave,
    },
  };
}
