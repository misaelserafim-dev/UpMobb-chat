import type { ThemeColor } from "@/utils/theme.ts";

export type ThemePickerMenuProps = {
  open?: boolean;
  themeId?: string;
  colors?: ThemeColor[];
  onSelect?: (id: string) => void;
};
