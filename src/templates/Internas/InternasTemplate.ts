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
  children?: ReactNode;
};
