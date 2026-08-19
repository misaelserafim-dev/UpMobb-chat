import { useEffect, useRef, useState, type MouseEvent } from "react";
import { DistortedPixels } from "@/utils/distortedPixels.ts";
import type { ChatEmptyProps } from "./ChatEmpty.ts";
import "./ChatEmpty.css";

const waBackground = new URL("../../assets/wa-background.png", import.meta.url).href;

/**
 * Troca fácil se não gostar do distort:
 * - "distort" → DistortedPixels (akella/Codrops)
 * - "tilt"    → inclinação 3D atual
 */
const LOGO_EFFECT: "distort" | "tilt" = "distort";

const MAX_TILT = 14;

export function ChatEmpty({ loading = false }: ChatEmptyProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const preferReduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const useDistort = LOGO_EFFECT === "distort" && !preferReduce && !loading;

  useEffect(() => {
    if (!useDistort || !canvasRef.current) return;
    if (!DistortedPixels.isSupported()) return;

    let instance: DistortedPixels | null = null;
    try {
      instance = new DistortedPixels(canvasRef.current, {
        imageUrl: waBackground,
        // === Ajuste o efeito aqui ===
        grid: 56, // detalhe do grid (↑ = mais fino)
        mouseRadius: 0.45, // área de influência (↑ = maior)
        strength: 0.55, // força do puxão (↑ = mais forte)
        relaxation: 0.93, // volta ao normal (↑ perto de 1 = mais lento)
        offsetScale: 0.045, // tamanho visual da distorção (↑ = mais “esticado”)
        canvasHeightScale: 1.7, // altura do canvas (↑ = mais área vertical; imagem no centro)
      });
    } catch {
      return;
    }
    return () => instance?.destroy();
  }, [useDistort]);

  function onMove(e: MouseEvent<HTMLElement>) {
    if (LOGO_EFFECT !== "tilt" || loading) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
    });
  }

  function onLeave() {
    if (LOGO_EFFECT !== "tilt") return;
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      ref={rootRef}
      className={`chat-empty${loading ? " chat-empty--loading" : ""}`}
      id="chat-empty"
      aria-label={loading ? "Carregando conversa" : "Nenhuma conversa selecionada"}
      aria-busy={loading || undefined}
      onMouseMove={LOGO_EFFECT === "tilt" && !loading ? onMove : undefined}
      onMouseLeave={LOGO_EFFECT === "tilt" && !loading ? onLeave : undefined}
    >
      {!loading && useDistort ? (
        <canvas
          ref={canvasRef}
          className="chat-empty__logo chat-empty__logo--canvas"
          aria-hidden="true"
        />
      ) : null}

      {!loading && !useDistort ? (
        <img
          className="chat-empty__logo"
          src={waBackground}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={
            LOGO_EFFECT === "tilt" && !preferReduce
              ? {
                  transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }
              : undefined
          }
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
