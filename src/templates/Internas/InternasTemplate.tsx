import type { InternasTemplateProps } from "./InternasTemplate.ts";
import "./InternasTemplate.css";

export function InternasTemplate({ children }: InternasTemplateProps) {
  return <div className="internas-template">{children}</div>;
}
