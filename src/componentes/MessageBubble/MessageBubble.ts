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
  /** Arrastar horizontal (mouse/touch) → mesma ação de Responder do menu. */
  onReply?: () => void;
  /** Arrastar para cima → apagar (só mensagens enviadas). */
  onDelete?: () => void;
  /** Clique na quote → rola até a mensagem original. */
  onQuoteClick?: (messageId: string) => void;
};
