import { Icons } from "../Icons/Icons.tsx";
import type { AddButtonProps } from "./AddButton.ts";
import "./AddButton.css";

export function AddButton({
  id,
  label = "Adicionar",
  title,
  className = "",
  type = "button",
  onClick,
}: AddButtonProps) {
  const tip = title || label;
  const classes = ["add-btn", className].filter(Boolean).join(" ");

  return (
    <button type={type} id={id} className={classes} aria-label={label} title={tip} onClick={onClick}>
      <Icons.Plus />
    </button>
  );
}
