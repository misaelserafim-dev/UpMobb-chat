export type AddButtonProps = {
  id?: string;
  label?: string;
  title?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};
