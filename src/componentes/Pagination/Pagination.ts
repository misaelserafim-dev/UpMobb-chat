export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  /** Se true (padrão), não renderiza quando só há 1 página. */
  hideWhenSingle?: boolean;
};
