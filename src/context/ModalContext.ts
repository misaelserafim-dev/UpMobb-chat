import type { ReactNode } from "react";

export type ModalContextValue = {
  isOpen: boolean;
};

export type ModalProviderProps = {
  children: ReactNode;
};
