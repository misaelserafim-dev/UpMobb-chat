export type LightboxProps = {
  open: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
};
