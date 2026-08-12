export const REACTION_EMOJIS = [
  { id: "thumbsup", emoji: "👍", label: "Curtir" },
  { id: "heart", emoji: "❤️", label: "Amar" },
  { id: "joy", emoji: "😂", label: "Haha" },
  { id: "wow", emoji: "😮", label: "Uau" },
  { id: "sad", emoji: "😢", label: "Triste" },
  { id: "pray", emoji: "🙏", label: "Orar" },
];

export function getEmojiById(id) {
  return REACTION_EMOJIS.find((e) => e.id === id) || null;
}
