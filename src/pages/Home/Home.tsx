import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatEmpty } from "@/componentes/ChatEmpty/ChatEmpty.tsx";
import { ChatList } from "@/componentes/ChatList/ChatList.tsx";
import { ChatWindow } from "@/componentes/ChatWindow/ChatWindow.tsx";
import { TopNav } from "@/componentes/TopNav/TopNav.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { HomeTemplate } from "@/templates/Home/HomeTemplate.tsx";
import type { ComposerSendPayload } from "@/componentes/ChatInput/ChatInput.ts";
import type { ChatItemData } from "@/componentes/ChatItem/ChatItem.ts";
import {
  assignChat,
  deleteChat,
  deleteChatMessage,
  fetchChatMessages,
  fetchChats,
  reactChatMessage,
  resolveChat,
  sendChatMessage,
  toChatMessage,
  type ChatMessage,
  type MessageDto,
} from "@/services/chats.ts";
import { getSocket } from "@/services/socket.ts";
import { applyTheme, getSavedThemeId } from "@/utils/theme.ts";
import { DEFAULT_FILTERS } from "@/utils/chatData.ts";
import { useListResize } from "@/hooks/useListResize.ts";
import "./Home.css";

type HomeLocationState = {
  openChatId?: string;
};

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const chatLoadToken = useRef(0);
  const pendingOpenChatId = useRef<string | null>(null);
  const listRef = useRef<HTMLElement>(null);
  const isAdmin = user?.role === "admin";
  const filters = isAdmin
    ? DEFAULT_FILTERS
    : DEFAULT_FILTERS.filter((f) => f.id !== "todos");

  const [themeId, setThemeId] = useState(getSavedThemeId);
  const [activeFilter, setActiveFilter] = useState(() =>
    isAdmin ? "todos" : "meus",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [chatsData, setChatsData] = useState<ChatItemData[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatItemData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const { morphPhase, resizeVersion, handleProps } = useListResize({
    listRef,
    enabled: !listLoading,
  });

  useEffect(() => {
    document.title = activeChat?.name
      ? `conversando com ${activeChat.name}`
      : "Upmobb | Chat";
    applyTheme(themeId);
  }, [themeId, activeChat]);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    fetchChats({ filter: activeFilter })
      .then((res) => {
        if (cancelled) return;
        setChatsData(res.items);
        setListLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setChatsData([]);
        setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  const refetchChats = useEffectEvent(() => {
    void fetchChats({ filter: activeFilter })
      .then((res) => setChatsData(res.items))
      .catch(() => {});
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    type MessageEvent = { conversationId: string; message: MessageDto };

    const onMessageNew = ({ conversationId, message }: MessageEvent) => {
      const msg = toChatMessage(message);
      if (conversationId === activeChatId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      setChatsData((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, preview: msg.text || c.preview, time: msg.time } : c,
        ),
      );
    };

    const onMessageUpdated = ({ conversationId, message }: MessageEvent) => {
      if (conversationId !== activeChatId) return;
      const msg = toChatMessage(message);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onConversationUpdated = () => {
      refetchChats();
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:updated", onMessageUpdated);
    socket.on("conversation:updated", onConversationUpdated);

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("message:updated", onMessageUpdated);
      socket.off("conversation:updated", onConversationUpdated);
    };
  }, [activeChatId]);

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
        (chat.preview || "").toLowerCase().includes(q) ||
        (chat.phone || "").toLowerCase().includes(q)
      );
    });

  async function selectChat(id: string, chatOverride?: ChatItemData) {
    if (id === activeChatId && !chatLoading) return;

    const selected = chatOverride || chatsData.find((c) => c.id === id);
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

  const openPendingChat = useEffectEvent((id: string) => {
    void selectChat(id);
  });

  useEffect(() => {
    const state = location.state as HomeLocationState | null;
    if (state?.openChatId) {
      pendingOpenChatId.current = state.openChatId;
      navigate("/", { replace: true, state: null });
    }

    if (listLoading) return;
    const id = pendingOpenChatId.current;
    if (!id) return;
    if (!chatsData.some((c) => c.id === id)) return;

    pendingOpenChatId.current = null;
    openPendingChat(id);
  }, [location.state, listLoading, chatsData, navigate]);

  function closeChat() {
    chatLoadToken.current += 1;
    setActiveChat(null);
    setActiveChatId(null);
    setMessages([]);
    setChatLoading(false);
  }

  async function handleSend({ text, html, attachments, audio, replyTo }: ComposerSendPayload) {
    if (!activeChat) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const stamp = Date.now();
    const batch: ChatMessage[] = [];
    const replyPayload = replyTo ? { ...replyTo } : undefined;

    if (audio?.src) {
      batch.push({
        id: `local-${stamp}`,
        from: "out",
        time,
        read: false,
        audio: { src: audio.src, durationSec: audio.durationSec },
        ...(replyPayload ? { replyTo: replyPayload } : {}),
      });
    } else if (!attachments.length) {
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

    const chatId = activeChat.id;
    const saved: ChatMessage[] = [];
    for (const msg of batch) {
      saved.push(await sendChatMessage({ chatId, message: msg }));
    }
    // O socket pode entregar a própria mensagem antes do retorno HTTP — dedup por id
    setMessages((prev) => [...prev, ...saved.filter((s) => !prev.some((m) => m.id === s.id))]);
    setChatsData((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              preview:
                saved.at(-1)?.text ||
                (saved.at(-1)?.audio ? "Áudio" : undefined) ||
                saved.at(-1)?.attachment?.name ||
                c.preview,
              time: saved.at(-1)?.time || c.time,
            }
          : c,
      ),
    );
  }

  async function handleDeleteMessage(messageId: string) {
    if (!activeChat) return;
    await deleteChatMessage({ chatId: activeChat.id, messageId });
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  async function handleReactMessage(messageId: string, emoji: string) {
    if (!activeChat) return;
    const updated = await reactChatMessage({
      chatId: activeChat.id,
      messageId,
      emoji,
    });
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleThemeChange(id: string) {
    setThemeId(id);
    applyTheme(id);
  }

  function handleNavigate(id: string) {
    if (id === "conversas") {
      navigate("/");
      return;
    }
    if (id === "contatos") {
      navigate("/contatos");
      return;
    }
    if (id === "componentes") {
      navigate("/componentes");
      return;
    }
    navigate(`/${id}`);
  }

  async function handleAction(action: string) {
    if (!activeChat) return;
    const id = activeChat.id;

    if (action === "deletar") {
      void deleteChat({ id }).then(() => {
        setChatsData((prev) => prev.filter((c) => c.id !== id));
        closeChat();
      });
      return;
    }

    if (action === "assumir") {
      await assignChat(id);
      setActiveChat((prev) => (prev ? { ...prev, status: "open" } : prev));
      const list = await fetchChats({ filter: activeFilter });
      setChatsData(list.items);
      const nextMessages = await fetchChatMessages(id);
      setMessages(nextMessages);
      return;
    }

    if (action === "resolver") {
      await resolveChat(id);
      closeChat();
      const list = await fetchChats({ filter: activeFilter });
      setChatsData(list.items);
    }
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
          void handleAction(action);
        }}
      />
    );
  }

  return (
    <HomeTemplate mobilePanel={activeChatId || chatLoading ? "chat" : "list"}>
      <TopNav
        active="conversas"
        searchQuery={searchQuery}
        searchDisabled={listLoading}
        themeId={themeId}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
      />

      <div className="workspace" id="workspace">
        <ChatList
          ref={listRef}
          chats={chats}
          filters={filters}
          activeFilter={activeFilter}
          loading={listLoading}
          morphPhase={morphPhase}
          resizeVersion={resizeVersion}
          onFilterChange={setActiveFilter}
          onChatSelect={selectChat}
          onChatDropOnEmpty={selectChat}
        />

        <div
          className="list-resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar lista de conversas"
          title="Arraste para redimensionar"
          {...handleProps}
        >
          <span className="list-resize-handle__grip" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>

        {panel}
      </div>
    </HomeTemplate>
  );
}
