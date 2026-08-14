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
  clearListMorphDrag,
  getListMorphDrag,
  getSavedListWidth,
  LIST_WIDTH_DEFAULT,
  saveListWidth,
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
  const dragRef = useRef({ startX: 0, startW: 0 });
  const settleTimerRef = useRef(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    applyListWidth(getSavedListWidth());
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(settleTimerRef.current);
      document.body.classList.remove("is-resizing-list");
    };
  }, []);

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
    }, 560);
  }

  function finishDrag(currentTarget: HTMLElement, pointerId: number) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    document.body.classList.remove("is-resizing-list");

    if (currentTarget.hasPointerCapture?.(pointerId)) {
      currentTarget.releasePointerCapture(pointerId);
    }

    const list = listRef.current;
    const current = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--list-w"),
    );
    saveListWidth(current);
    if (list) beginSettle(list);
    setResizeVersion((v) => v + 1);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (!enabled || e.button !== 0) return;
    const list = listRef.current;
    if (!list) return;

    e.preventDefault();
    draggingRef.current = true;
    dragRef.current = {
      startX: e.clientX,
      startW: list.getBoundingClientRect().width,
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
    applyListWidth(dragRef.current.startW + dx);
    if (!reduceMotionRef.current) {
      applyListMorphDrag(list, getListMorphDrag(dx));
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    finishDrag(e.currentTarget, e.pointerId);
  }

  function onDoubleClick() {
    if (!enabled) return;
    const list = listRef.current;
    if (!list) return;

    const before = list.getBoundingClientRect().width;
    applyListWidth(LIST_WIDTH_DEFAULT);
    saveListWidth(LIST_WIDTH_DEFAULT);

    if (!reduceMotionRef.current) {
      applyListMorphDrag(list, getListMorphDrag(LIST_WIDTH_DEFAULT - before));
      setMorphPhase("drag");
    }
    beginSettle(list);
    setResizeVersion((v) => v + 1);
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
