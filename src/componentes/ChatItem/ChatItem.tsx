import type { ChatItemData, ChatItemProps, ChatTag } from "./ChatItem.ts";
import "./ChatItem.css";

function TagBadge({ tag }: { tag?: ChatTag }) {
  if (!tag) return null;

  if (tag.type === "icon" && tag.icon) {
    return (
      <span className="chat-tag chat-tag--icon" title={tag.label || ""}>
        <img src={tag.icon} alt="" />
      </span>
    );
  }

  return (
    <span
      className="chat-tag chat-tag--color"
      title={tag.label || ""}
      style={{ background: tag.color || "#22c55e" }}
    />
  );
}

export function ChatItem({ chat, onClick }: ChatItemProps) {
  return (
    <li
      className={`chat-item${chat.active ? " chat-item--active" : ""}`}
      data-chat-id={chat.id}
      role="button"
      tabIndex={0}
      title={chat.preview || undefined}
      style={chat.color ? { borderLeftColor: chat.color } : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="chat-item__avatar-wrap">
        <img className="avatar" src={chat.avatar} alt="" />
        <TagBadge tag={chat.tag} />
      </div>
      <div className="chat-item__body">
        <div className="chat-item__top">
          <span className="chat-item__name">{chat.name}</span>
          <span className="chat-item__time">{chat.time || ""}</span>
        </div>
        <div className="chat-item__bottom">
          <p className="chat-item__preview">{chat.preview || ""}</p>
          {chat.unread ? <span className="badge">{chat.unread}</span> : null}
        </div>
      </div>
    </li>
  );
}

export type { ChatItemData };
