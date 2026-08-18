export type EtiquetaSelectItem = {
  id: string;
  name: string;
  color: string;
};

export type EtiquetaSelectProps = {
  items: EtiquetaSelectItem[];
  value: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Menu acima do trigger (útil em formulários perto do rodapé). */
  menuPlacement?: "above" | "below";
  onOpenChange?: (open: boolean) => void;
  className?: string;
};
