import type { ReactNode } from "react";
import "./HomeTemplate.css";

export type HomeTemplateProps = {
  children?: ReactNode;
  mobilePanel?: "list" | "chat";
};

export function HomeTemplate({ children, mobilePanel = "list" }: HomeTemplateProps) {
  return (
    <div className="app" data-mobile-panel={mobilePanel}>
      {children}
    </div>
  );
}
