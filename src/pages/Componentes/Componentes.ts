export type ComponentesProps = Record<string, never>;

export const SAMPLE_CHATS = [
  {
    id: "1",
    name: "Ana Souza",
    avatar: "https://i.pravatar.cc/80?u=ana",
    time: "10:42",
    preview: "Pode me enviar o orçamento?",
    unread: 2,
    active: true,
    color: "#0063a3",
    tag: { type: "color" as const, color: "#22c55e", label: "WhatsApp" },
  },
  {
    id: "2",
    name: "Carlos Lima",
    avatar: "https://i.pravatar.cc/80?u=carlos",
    time: "Ontem",
    preview: "Ok, combinado!",
    unread: 0,
    active: false,
  },
];
