import { useEffect, useEffectEvent, useRef, type RefObject } from "react";

type UseDismissableOptions = {
  open: boolean;
  onDismiss: () => void;
  refs: Array<RefObject<HTMLElement | null>>;
  escape?: boolean;
};

export function useDismissable({
  open,
  onDismiss,
  refs,
  escape = true,
}: UseDismissableOptions) {
  const refsRef = useRef(refs);
  refsRef.current = refs;

  const handleDismiss = useEffectEvent(() => {
    onDismiss();
  });

  useEffect(() => {
    if (!open) return;

    function isInside(target: EventTarget | null) {
      if (!(target instanceof Node)) return false;
      return refsRef.current.some((ref) => ref.current?.contains(target));
    }

    function onPointerDown(e: PointerEvent) {
      if (isInside(e.target)) return;
      handleDismiss();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!escape || e.key !== "Escape") return;
      e.preventDefault();
      handleDismiss();
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, escape]);
}
