import type { DialCode } from "@/utils/dialCodes.ts";

export type PhoneDdiProps = {
  /** ISO do país selecionado (ex.: `"BR"`). */
  value: string;
  onChange: (code: DialCode) => void;
  id?: string;
  className?: string;
};
