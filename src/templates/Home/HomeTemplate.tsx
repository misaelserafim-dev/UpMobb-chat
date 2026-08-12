import type { HomeTemplateProps } from "./HomeTemplate.ts";
import "./HomeTemplate.css";

export function HomeTemplate({ children }: HomeTemplateProps) {
  return <div className="home-template">{children}</div>;
}
