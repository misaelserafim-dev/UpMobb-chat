export const DEFAULT_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "meus", label: "Meus" },
  { id: "aguardando", label: "Aguardando" },
  { id: "resolvidos", label: "Resolvidos" },
  { id: "grupos", label: "Grupos" },
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
    audio?: boolean;
    attachment?: { name?: string };
  };
  reactions?: Array<{ emoji: string; count: number }>;
  image?: { src: string; alt?: string };
  video?: { src: string; poster?: string };
  audio?: { src: string; durationSec?: number };
  attachment?: {
    name: string;
    size?: string;
    pages?: string;
    type?: string;
    url?: string;
  };
};
