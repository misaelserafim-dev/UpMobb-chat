export type AddButtonProps = {
  id?: string;
  label?: string;
  title?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  /** Efeito de aproximação do mouse (leve). Default: true */
  magnetic?: boolean;
  onClick?: () => void;
};
