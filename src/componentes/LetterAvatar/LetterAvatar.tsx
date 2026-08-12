import type { LetterAvatarProps } from "./LetterAvatar.ts";

function initialLetter(name = "") {
  const trimmed = String(name).trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toLocaleUpperCase("pt-BR");
}

export function LetterAvatar({ name = "", status = "offline" }: LetterAvatarProps) {
  const letter = initialLetter(name);
  const online = status === "online";
  const statusLabel = online ? "Online" : "Offline";

  return (
    <span
      className="letter-avatar"
      title={statusLabel}
      aria-label={`${name || "Membro"}, ${statusLabel}`}
    >
      <span className="letter-avatar__circle" aria-hidden="true">
        {letter}
      </span>
      <span
        className={`letter-avatar__status ${online ? "is-online" : "is-offline"}`}
        aria-hidden="true"
      />
    </span>
  );
}
