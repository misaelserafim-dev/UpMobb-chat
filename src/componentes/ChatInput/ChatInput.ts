import type { ChatMessage } from "@/utils/chatData.ts";

export type PendingAttachment = {
  id: string;
  kind: "image" | "video" | "file";
  src: string;
  name: string;
  type: string;
  ext: string;
  sizeLabel: string;
};

export type ReplyDraft = NonNullable<ChatMessage["replyTo"]>;

export type ComposerSendPayload = {
  text: string;
  html?: string;
  attachments: PendingAttachment[];
  replyTo?: ReplyDraft | null;
};

export type ChatInputProps = {
  conversationId?: string;
  replyTo?: ReplyDraft | null;
  onClearReply?: () => void;
  onSend?: (payload: ComposerSendPayload) => void;
  onPreviewChange?: (hasPreview: boolean) => void;
  onDropTargetChange?: (active: boolean) => void;
};
