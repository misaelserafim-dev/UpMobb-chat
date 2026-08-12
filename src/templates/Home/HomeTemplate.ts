import type { ReactNode } from "react";

export type HomeTemplateProps = {
  children?: ReactNode;
  mobilePanel?: "list" | "chat";
};
