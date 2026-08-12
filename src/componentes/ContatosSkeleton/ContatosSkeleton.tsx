import type { ContatosSkeletonProps } from "./ContatosSkeleton.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";

export function ContatosSkeleton({ count = 8 }: ContatosSkeletonProps) {
  return (
    <>
      <div className="contact-table__head" aria-hidden="true">
        <span className="contact-table__col contact-table__col--person">Contato</span>
        <span className="contact-table__col contact-table__col--label">Etiquetas</span>
        <span className="contact-table__col contact-table__col--actions">Ações</span>
      </div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="contact-row contact-row--skeleton" aria-hidden="true">
          <div className="contact-row__person">
            <span className="skeleton skeleton--avatar contact-row__skeleton-avatar" />
            <div className="contact-row__meta">
              <span className="skeleton skeleton--line contact-row__skeleton-name" />
              <span className="skeleton skeleton--line contact-row__skeleton-phone" />
            </div>
          </div>
          <div className="contact-row__etiqueta">
            <span className="skeleton skeleton--line contact-row__skeleton-tag" />
          </div>
          <div className="contact-row__actions">
            <span className="skeleton contact-row__skeleton-action" />
            <span className="skeleton contact-row__skeleton-action" />
            <span className="skeleton contact-row__skeleton-action" />
          </div>
        </div>
      ))}
    </>
  );
}
