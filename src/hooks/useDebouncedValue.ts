import { useEffect, useState } from "react";
import { debounce } from "@/utils/debounce.ts";

/** Valor que só atualiza depois de `wait` ms sem mudanças. */
export function useDebouncedValue<T>(value: T, wait = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const run = debounce(() => {
      setDebounced(value);
    }, wait);
    run();
    return () => run.cancel();
  }, [value, wait]);

  return debounced;
}
