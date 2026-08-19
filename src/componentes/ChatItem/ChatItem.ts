export type ChatTag = {
  type?: "icon" | "color";
  icon?: string;
  label?: string;
  color?: string;
};

export type ChatItemData = {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  time?: string;
  preview?: string;
  unread?: number;
  active?: boolean;
  color?: string;
  assignee?: string;
  tag?: ChatTag;
  status?: "waiting" | "open" | "resolved";
};

export type ChatItemProps = {
  chat: ChatItemData;
  onClick?: () => void;
  morphIndex?: number;
  morphPhase?: "idle" | "drag" | "settle";
};
