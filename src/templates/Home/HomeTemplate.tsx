import type { HomeTemplateProps } from "./HomeTemplate.ts";
import "./HomeTemplate.css";

export function HomeTemplate({ children, mobilePanel = "list" }: HomeTemplateProps) {
  return (
    <div className="app" data-mobile-panel={mobilePanel}>
      {children}
    </div>
  );
}
