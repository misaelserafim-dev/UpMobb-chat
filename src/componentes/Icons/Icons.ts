export type IconSize = "sm" | "xs" | "md";

export type IconProps = {
  className?: string;
  size?: IconSize;
};

export function iconClassName(size: IconSize = "sm", className?: string): string {
  const sizeClass =
    size === "md" ? "icon" : size === "xs" ? "icon icon--xs" : "icon icon--sm";

  return [sizeClass, className].filter(Boolean).join(" ");
}
