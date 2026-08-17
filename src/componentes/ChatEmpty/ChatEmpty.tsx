import type { ChatEmptyProps } from "./ChatEmpty.ts";
import "./ChatEmpty.css";

const waBackground = new URL("../../assets/wa-background.png", import.meta.url).href;

export function ChatEmpty({ loading = false }: ChatEmptyProps) {
  return (
    <section
      className={`chat-empty${loading ? " chat-empty--loading" : ""}`}
      id="chat-empty"
      aria-label={loading ? "Carregando conversa" : "Nenhuma conversa selecionada"}
      aria-busy={loading || undefined}
      style={
        loading
          ? undefined
          : {
              backgroundImage: `url(${waBackground})`,
            }
      }
    >
      <div
        className={`chat-progress${loading ? " is-active" : ""}`}
        id="chat-progress"
        role="progressbar"
        aria-hidden={loading ? false : true}
        aria-valuetext={loading ? "Carregando" : undefined}
      >
        <span className="chat-progress__bar" />
      </div>
    </section>
  );
}
