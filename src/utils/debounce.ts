type DebouncedFn<T extends unknown[]> = ((...args: T) => void) & {
  cancel: () => void;
};

/** Atrasa a execução de `fn` até `wait` ms sem novas chamadas. */
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  wait: number,
): DebouncedFn<T> {
  let timer = 0;

  const debounced = ((...args: T) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  }) as DebouncedFn<T>;

  debounced.cancel = () => {
    window.clearTimeout(timer);
    timer = 0;
  };

  return debounced;
}
