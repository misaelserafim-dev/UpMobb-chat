import { useRef, useState, type MouseEvent } from "react";
import type { ChatEmptyProps } from "./ChatEmpty.ts";
import "./ChatEmpty.css";

const waBackground = new URL("../../assets/wa-background.png", import.meta.url).href;

const MAX_TILT = 14; // graus

export function ChatEmpty({ loading = false }: ChatEmptyProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: MouseEvent<HTMLElement>) {
    const el = rootRef.current;
    if (!el || loading) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    // Centro = 0; borda = ±MAX_TILT
    setTilt({
      x: (0.5 - py) * MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
    });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      ref={rootRef}
      className={`chat-empty${loading ? " chat-empty--loading" : ""}`}
      id="chat-empty"
      aria-label={loading ? "Carregando conversa" : "Nenhuma conversa selecionada"}
      aria-busy={loading || undefined}
      onMouseMove={loading ? undefined : onMove}
      onMouseLeave={loading ? undefined : onLeave}
    >
      {!loading ? (
        <img
          className="chat-empty__logo"
          src={waBackground}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        />
      ) : null}

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
