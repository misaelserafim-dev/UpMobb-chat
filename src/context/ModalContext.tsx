import { createContext, useContext } from "react";
import type { ModalContextValue, ModalProviderProps } from "./ModalContext.ts";

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: ModalProviderProps) {
  const value: ModalContextValue = {
    isOpen: false,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal deve ser usado dentro de ModalProvider");
  }

  return context;
}
