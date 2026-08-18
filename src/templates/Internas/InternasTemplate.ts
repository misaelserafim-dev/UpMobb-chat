import type { ReactNode } from "react";

export type InternasTemplateProps = {
  active: string;
  title: string;
  countLabel?: string;
  pageId?: string;
  ariaLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  searchAriaLabel?: string;
  onSearchChange?: (value: string) => void;
  addId?: string;
  addLabel?: string;
  onAdd?: () => void;
  importId?: string;
  importLabel?: string;
  onImport?: () => void;
  /**
   * Liga scroll interno na lista + header sticky.
   * Na lista use também a class `sticky-table`.
   */
  stickyTable?: boolean;
  children?: ReactNode;
};
