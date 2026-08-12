import type { InternasListSkeletonProps } from "./InternasListSkeleton.ts";
import "@/componentes/ChatListSkeleton/ChatListSkeleton.css";
import "./InternasListSkeleton.css";

export function InternasListSkeleton({
  count = 8,
  columns = ["Nome", "Detalhe", "Ações"],
  actionCount = 2,
}: InternasListSkeletonProps) {
  return (
    <>
      <div className="contact-table__head" aria-hidden="true">
        <span className="contact-table__col contact-table__col--person">{columns[0]}</span>
        <span className="contact-table__col contact-table__col--label">{columns[1]}</span>
        <span className="contact-table__col contact-table__col--actions">{columns[2]}</span>
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
            {Array.from({ length: actionCount }, (_, j) => (
              <span key={j} className="skeleton contact-row__skeleton-action" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
