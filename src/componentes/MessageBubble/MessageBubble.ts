import type { MouseEvent } from "react";
import type { ChatMessage } from "@/utils/chatData.ts";
import type { DocumentPreviewFile } from "@/utils/documentPreview.ts";

export type MessageBubbleProps = {
  message: ChatMessage;
  senderName?: string;
  senderAvatar?: string;
  className?: string;
  onImageClick?: (src: string) => void;
  onDocumentClick?: (file: DocumentPreviewFile) => void;
  onContextMenu?: (e: MouseEvent) => void;
};
