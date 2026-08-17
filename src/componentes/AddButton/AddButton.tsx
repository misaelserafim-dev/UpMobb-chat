import { Icons } from "../Icons/Icons.tsx";
import { useMagnetic } from "@/hooks/useMagnetic.ts";
import type { AddButtonProps } from "./AddButton.ts";
import "@/styles/magnetic.css";
import "./AddButton.css";

export function AddButton({
  id,
  label = "Adicionar",
  title,
  className = "",
  type = "button",
  magnetic = true,
  onClick,
}: AddButtonProps) {
  const tip = title || label;
  const classes = ["add-btn", className].filter(Boolean).join(" ");
  const { magnetRef, style, magnetProps } = useMagnetic(magnetic);

  const button = (
    <button type={type} id={id} className={classes} aria-label={label} title={tip} onClick={onClick}>
      <Icons.Plus />
    </button>
  );

  if (!magnetic) return button;

  return (
    <div className="magnet" ref={magnetRef} {...magnetProps}>
      <div className="magnet__inner" style={style}>
        {button}
      </div>
    </div>
  );
}
