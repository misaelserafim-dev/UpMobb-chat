export const DEFAULT_FILTERS = [
  { id: "todos", label: "Todos", count: 21, dropdown: true },
  { id: "aguardando", label: "Aguardando", count: 11 },
  { id: "resolvidos", label: "Resolvidos", count: 40, dropdown: true },
  { id: "nao-lidas", label: "Não lidas", count: 5 },
];

export type ChatMessage = {
  id: string;
  from: "in" | "out" | "system";
  text?: string;
  html?: string;
  time: string;
  read?: boolean;
  forwarded?: boolean;
  replyTo?: {
    author?: string;
    text?: string;
    image?: boolean;
    video?: boolean;
    attachment?: { name?: string };
  };
  reactions?: Array<{ emoji: string; count: number }>;
  image?: { src: string; alt?: string };
  video?: { src: string; poster?: string };
  attachment?: {
    name: string;
    size?: string;
    pages?: string;
    type?: string;
    url?: string;
  };
};
