import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  applyListMorphDrag,
  applyListWidth,
  clampListWidth,
  clearListMorphDrag,
  getListMorphDrag,
  getListMorphJiggle,
  getSavedListWidth,
  LIST_WIDTH_DEFAULT,
  readListWidth,
  saveListWidth,
  springListWidth,
} from "@/utils/listResize.ts";

export type ListMorphPhase = "idle" | "drag" | "settle";

type UseListResizeOptions = {
  listRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

export function useListResize({ listRef, enabled = true }: UseListResizeOptions) {
  const [morphPhase, setMorphPhase] = useState<ListMorphPhase>("idle");
  const [resizeVersion, setResizeVersion] = useState(0);

  const draggingRef = useRef(false);
  const dragRef = useRef({ startX: 0, startW: 0, lastDx: 0 });
  const settleTimerRef = useRef(0);
  const stopSpringRef = useRef<(() => void) | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    applyListWidth(getSavedListWidth());
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(settleTimerRef.current);
      stopSpringRef.current?.();
      document.body.classList.remove("is-resizing-list");
    };
  }, []);

  function stopSpring() {
    stopSpringRef.current?.();
    stopSpringRef.current = null;
  }

  function beginSettle(list: HTMLElement) {
    clearListMorphDrag(list);
    if (reduceMotionRef.current) {
      setMorphPhase("idle");
      return;
    }
    setMorphPhase("settle");
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      setMorphPhase("idle");
    }, 620);
  }

  function finishDrag(currentTarget: HTMLElement, pointerId: number) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    document.body.classList.remove("is-resizing-list");

    if (currentTarget.hasPointerCapture?.(pointerId)) {
      currentTarget.releasePointerCapture(pointerId);
    }

    const list = listRef.current;
    const from = readListWidth();
    const to = clampListWidth(from);
    const lastDx = dragRef.current.lastDx;
    saveListWidth(to);

    if (!list) {
      applyListWidth(to);
      setResizeVersion((v) => v + 1);
      return;
    }

    if (reduceMotionRef.current) {
      applyListWidth(to);
      beginSettle(list);
      setResizeVersion((v) => v + 1);
      return;
    }

    // Sempre treme ao soltar — se não passou do max/min, dá um “kick” na mola
    const overshoot = Math.abs(from - to);
    let springFrom = from;
    let initialVelocity = 0;
    if (overshoot < 0.5) {
      springFrom = to;
      const dir = lastDx === 0 ? 1 : Math.sign(lastDx);
      const strength = Math.min(16, 5 + Math.abs(lastDx) * 0.1);
      initialVelocity = dir * strength;
    }

    setMorphPhase("drag");
    stopSpring();
    stopSpringRef.current = springListWidth(
      springFrom,
      to,
      (x, v) => {
        document.documentElement.style.setProperty("--list-w", `${x}px`);
        applyListMorphDrag(list, getListMorphJiggle(v));
      },
      () => {
        stopSpringRef.current = null;
        applyListWidth(to);
        beginSettle(list);
        setResizeVersion((v) => v + 1);
      },
      {
        initialVelocity,
        stiffness: overshoot > 0.5 ? 0.22 : 0.3,
        damping: overshoot > 0.5 ? 0.68 : 0.58,
      },
    );
  }

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (!enabled || e.button !== 0) return;
    const list = listRef.current;
    if (!list) return;

    e.preventDefault();
    stopSpring();
    draggingRef.current = true;
    dragRef.current = {
      startX: e.clientX,
      startW: list.getBoundingClientRect().width,
      lastDx: 0,
    };

    window.clearTimeout(settleTimerRef.current);
    clearListMorphDrag(list);
    setMorphPhase(reduceMotionRef.current ? "idle" : "drag");
    document.body.classList.add("is-resizing-list");
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    if (!draggingRef.current) return;
    const list = listRef.current;
    if (!list) return;

    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.lastDx = dx;
    const raw = dragRef.current.startW + dx;
    // Elástico além do min/max (não trava seco)
    applyListWidth(raw, { elastic: true });
    if (!reduceMotionRef.current) {
      applyListMorphDrag(list, getListMorphDrag(dx, raw));
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    finishDrag(e.currentTarget, e.pointerId);
  }

  function onDoubleClick() {
    if (!enabled) return;
    const list = listRef.current;
    if (!list) return;

    stopSpring();
    const before = list.getBoundingClientRect().width;
    const target = LIST_WIDTH_DEFAULT;
    saveListWidth(target);

    if (reduceMotionRef.current) {
      applyListWidth(target);
      beginSettle(list);
      setResizeVersion((v) => v + 1);
      return;
    }

    setMorphPhase("drag");
    stopSpringRef.current = springListWidth(
      before,
      target,
      (x, v) => {
        document.documentElement.style.setProperty("--list-w", `${x}px`);
        applyListMorphDrag(list, getListMorphJiggle(v));
      },
      () => {
        stopSpringRef.current = null;
        applyListWidth(target);
        beginSettle(list);
        setResizeVersion((v) => v + 1);
      },
      { stiffness: 0.24, damping: 0.64 },
    );
  }

  return {
    morphPhase,
    resizeVersion,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onLostPointerCapture: onPointerUp,
      onDoubleClick,
    },
  };
}
