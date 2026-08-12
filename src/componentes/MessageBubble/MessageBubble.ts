import type { MouseEvent } from "react";
import type { ChatMessage } from "@/utils/chatData.ts";

export type MessageBubbleProps = {
  message: ChatMessage;
  senderName?: string;
  className?: string;
  onImageClick?: (src: string) => void;
  onContextMenu?: (e: MouseEvent) => void;
};
