import type { ImportContactDraft } from "@/utils/contactImport.ts";

export type ContactImportModalProps = {
  open?: boolean;
  fileName?: string;
  rows?: ImportContactDraft[];
  replaceDuplicates?: boolean;
  importing?: boolean;
  error?: string;
  onReplaceChange?: (value: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
};
