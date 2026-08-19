import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

const STRUGGLE_MS = 2400;
const DRAG_LOCK = 7;

type PullState = {
  x: number;
  y: number;
  active: boolean;
  freed: boolean;
};

const IDLE: PullState = { x: 0, y: 0, active: false, freed: false };

/**
 * Puxar “teima” ~2.4s (treme cada vez mais), depois cede.
 * Clique curto continua normal (abrir menu).
 */
export function useStubbornPull(
  enabled = true,
  opts?: { onFreedRelease?: () => void },
) {
  const [pull, setPull] = useState<PullState>(IDLE);
  const drag = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    startTime: 0,
    moved: false,
    freed: false,
    suppressClick: false,
  });
  const rafRef = useRef(0);
  const latestPointer = useRef({ x: 0, y: 0 });
  const reduceRef = useRef(false);
  const onFreedReleaseRef = useRef(opts?.onFreedRelease);
  onFreedReleaseRef.current = opts?.onFreedRelease;

  useEffect(() => {
    reduceRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function stopLoop() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }

  function tick() {
    const d = drag.current;
    if (d.pointerId < 0) return;

    const now = performance.now();
    const progress = Math.min(1, (now - d.startTime) / STRUGGLE_MS);
    const freed = progress >= 1;
    d.freed = freed;

    const rawX = latestPointer.current.x - d.originX;
    const rawY = latestPointer.current.y - d.originY;

    const follow = freed ? 0.9 : 0.05 + progress * 0.12;
    // Tremor bem leve no começo; só no final fica forte como agora
    const amp = freed ? 1.2 : 0.4 + Math.pow(progress, 2.4) * 13.5;
    const freq = 14 + Math.pow(progress, 1.8) * 44;
    const t = now / 1000;
    const shakeX = Math.sin(t * freq) * amp;
    const shakeY = Math.cos(t * (freq * 0.87)) * amp * 0.85;

    setPull({
      x: rawX * follow + shakeX,
      y: rawY * follow + shakeY,
      active: true,
      freed,
    });

    rafRef.current = requestAnimationFrame(tick);
  }

  function endPull(e: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    if (d.pointerId !== e.pointerId && d.pointerId !== -1) return;

    const wasPull = d.moved;
    const wasFreed = d.freed;
    try {
      if (d.pointerId >= 0) e.currentTarget.releasePointerCapture(d.pointerId);
    } catch {
      /* ignore */
    }

    stopLoop();
    d.pointerId = -1;
    d.moved = false;
    d.freed = false;
    if (wasPull) {
      d.suppressClick = true;
      window.setTimeout(() => {
        d.suppressClick = false;
      }, 40);
      if (wasFreed) onFreedReleaseRef.current?.();
    }
    setPull(IDLE);
  }

  const style: CSSProperties = pull.active
    ? {
        transform: `translate3d(${pull.x}px, ${pull.y}px, 0)`,
        transition: "none",
        zIndex: 40,
      }
    : {
        transform: "translate3d(0px, 0px, 0)",
        transition: "transform 0.55s cubic-bezier(0.22, 1.55, 0.36, 1)",
      };

  return {
    pull,
    isPulling: pull.active,
    shouldSuppressClick: () => drag.current.suppressClick,
    style,
    className: pull.active ? `is-pulling${pull.freed ? " is-pull-freed" : ""}` : "",
    pullProps: {
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        if (!enabled || reduceRef.current) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        drag.current.pointerId = e.pointerId;
        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;
        drag.current.originX = e.clientX;
        drag.current.originY = e.clientY;
        drag.current.startTime = performance.now();
        drag.current.moved = false;
        drag.current.freed = false;
        latestPointer.current = { x: e.clientX, y: e.clientY };
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        const d = drag.current;
        if (!enabled || reduceRef.current || d.pointerId !== e.pointerId) return;

        latestPointer.current = { x: e.clientX, y: e.clientY };
        const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);

        if (!d.moved) {
          if (dist < DRAG_LOCK) return;
          d.moved = true;
          d.startTime = performance.now();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
          stopLoop();
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      onPointerUp: endPull,
      onPointerCancel: endPull,
    },
  };
}
