import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";

export type DocumentPreviewProps = {
  open: boolean;
  file: DocumentPreviewFile | null;
  onClose: () => void;
};
