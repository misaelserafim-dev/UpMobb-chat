import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatEmpty } from "@/componentes/ChatEmpty/ChatEmpty.tsx";
import { ChatList } from "@/componentes/ChatList/ChatList.tsx";
import { ChatWindow } from "@/componentes/ChatWindow/ChatWindow.tsx";
import { TopNav } from "@/componentes/TopNav/TopNav.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { HomeTemplate } from "@/templates/Home/HomeTemplate.tsx";
import {
  fetchChatMessages,
  SAMPLE_CHATS,
  type ChatMessage,
} from "@/utils/chatData.ts";
import type { ComposerSendPayload } from "@/componentes/ChatInput/ChatInput.ts";
import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import { applyListWidth, getSavedListWidth, initListResize } from "@/utils/listResize.ts";
import { applyTheme, getSavedThemeId } from "@/utils/theme.ts";
import "./Home.css";

export function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const chatLoadToken = useRef(0);

  const [themeId, setThemeId] = useState(getSavedThemeId);
  const [activeNav, setActiveNav] = useState("conversas");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatsData, setChatsData] = useState(() => SAMPLE_CHATS.map((c) => ({ ...c })));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatItemData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    document.title = activeChat?.name
      ? `conversando com ${activeChat.name}`
      : "Upmobb | Chat";
    applyTheme(themeId);
  }, [themeId, activeChat]);

  useEffect(() => {
    applyListWidth(getSavedListWidth());
  }, []);

  useEffect(() => {
    if (activeNav !== "conversas" || listLoading) return;
    return initListResize();
  }, [activeNav, listLoading]);

  useEffect(() => {
    const timer = window.setTimeout(() => setListLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const chats = chatsData
    .map((chat) => ({
      ...chat,
      active: chat.id === activeChatId,
    }))
    .filter((chat) => {
      if (!q) return true;
      return (
        chat.name.toLowerCase().includes(q) ||
        (chat.preview || "").toLowerCase().includes(q)
      );
    });

  async function selectChat(id: string) {
    const selected = chatsData.find((c) => c.id === id);
    if (!selected) return;

    const token = ++chatLoadToken.current;
    setActiveChatId(id);
    setActiveChat(null);
    setMessages([]);
    setChatLoading(true);

    try {
      const nextMessages = await fetchChatMessages(id);
      if (token !== chatLoadToken.current) return;

      setActiveChat({ ...selected, active: true });
      setMessages(nextMessages);
      setChatLoading(false);
    } catch {
      if (token !== chatLoadToken.current) return;
      setChatLoading(false);
      setActiveChat(null);
      setActiveChatId(null);
    }
  }

  function closeChat() {
    chatLoadToken.current += 1;
    setActiveChat(null);
    setActiveChatId(null);
    setMessages([]);
    setChatLoading(false);
  }

  function handleSend({ text, html, attachments, replyTo }: ComposerSendPayload) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const stamp = Date.now();
    const batch: ChatMessage[] = [];
    const replyPayload = replyTo ? { ...replyTo } : undefined;

    if (!attachments.length) {
      batch.push({
        id: `local-${stamp}`,
        from: "out",
        text,
        html,
        time,
        read: false,
        ...(replyPayload ? { replyTo: replyPayload } : {}),
      });
    } else {
      attachments.forEach((file, index) => {
        const isLast = index === attachments.length - 1;
        const msg: ChatMessage = {
          id: `local-${stamp}-${index}`,
          from: "out",
          time,
          read: false,
        };

        if (file.kind === "image") {
          msg.image = { src: file.src, alt: file.name || "Imagem" };
        } else if (file.kind === "video") {
          msg.video = { src: file.src };
        } else {
          msg.attachment = {
            name: file.name,
            size: file.sizeLabel,
            type: file.ext === "PDF" ? "pdf" : "file",
            url: file.src,
          };
        }

        if (isLast) {
          if (text) {
            msg.text = text;
            msg.html = html;
          }
          if (replyPayload) msg.replyTo = replyPayload;
        }

        batch.push(msg);
      });
    }

    setMessages((prev) => [...prev, ...batch]);
  }

  function handleDeleteMessage(messageId: string) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  function handleReactMessage(messageId: string, emoji: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = [...(m.reactions || [])];
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing) existing.count += 1;
        else reactions.push({ emoji, count: 1 });
        return { ...m, reactions };
      }),
    );
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleThemeChange(id: string) {
    setThemeId(id);
    applyTheme(id);
  }

  let panel = <ChatEmpty />;
  if (chatLoading) {
    panel = <ChatEmpty loading />;
  } else if (activeChat) {
    panel = (
      <ChatWindow
        activeChat={activeChat}
        messages={messages}
        onBack={closeChat}
        onSend={handleSend}
        onDeleteMessage={handleDeleteMessage}
        onReactMessage={handleReactMessage}
        onAction={(action) => {
          if (action === "deletar") {
            const id = activeChat.id;
            setChatsData((prev) => prev.filter((c) => c.id !== id));
            closeChat();
          }
        }}
      />
    );
  }

  return (
    <HomeTemplate mobilePanel={activeChatId || chatLoading ? "chat" : "list"}>
      <TopNav
        active={activeNav}
        searchQuery={searchQuery}
        searchDisabled={listLoading}
        themeId={themeId}
        onSearchChange={setSearchQuery}
        onNavigate={(id) => {
          setActiveNav(id);
          if (id !== "conversas") closeChat();
        }}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
      />

      <div className="workspace" id="workspace">
        {activeNav === "conversas" ? (
          <>
            <ChatList
              chats={chats}
              activeFilter={activeFilter}
              loading={listLoading}
              onFilterChange={setActiveFilter}
              onChatSelect={selectChat}
            />

            <div
              className="list-resize-handle"
              id="list-resize-handle"
              role="separator"
              aria-orientation="vertical"
              aria-label="Redimensionar lista de conversas"
              title="Arraste para redimensionar"
            >
              <span className="list-resize-handle__grip" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>

            {panel}
          </>
        ) : (
          <ChatEmpty />
        )}
      </div>
    </HomeTemplate>
  );
}
