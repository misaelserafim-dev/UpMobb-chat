import { InternasListSkeleton } from "@/componentes/InternasListSkeleton/InternasListSkeleton.tsx";
import type { ContatosSkeletonProps } from "./ContatosSkeleton.ts";

export function ContatosSkeleton({ count = 8 }: ContatosSkeletonProps) {
  return (
    <InternasListSkeleton
      count={count}
      columns={["Contato", "Etiquetas", "Ações"]}
      actionCount={3}
    />
  );
}
