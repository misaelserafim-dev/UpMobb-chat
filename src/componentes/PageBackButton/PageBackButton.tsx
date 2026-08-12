import { Icons } from "../Icons/Icons.tsx";
import type { PageBackButtonProps } from "./PageBackButton.ts";

export function PageBackButton({ onClick }: PageBackButtonProps) {
  return (
    <button type="button" className="chat-window__back icon-btn" aria-label="Voltar" onClick={onClick}>
      <Icons.ChevronLeft />
    </button>
  );
}
