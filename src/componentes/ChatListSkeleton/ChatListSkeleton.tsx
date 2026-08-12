import type { ChatListSkeletonProps, FiltersCarouselSkeletonProps } from "./ChatListSkeleton.ts";
import "./ChatListSkeleton.css";

const FILTER_WIDTHS = [72, 88, 104, 96, 80, 90];

export function FiltersCarouselSkeleton({ count = 5 }: FiltersCarouselSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div className="embla__slide" aria-hidden="true" key={i}>
          <span
            className="filter-chip filter-chip--skeleton skeleton"
            style={{ width: FILTER_WIDTHS[i % FILTER_WIDTHS.length] }}
          />
        </div>
      ))}
    </>
  );
}

export function ChatListSkeleton({ count = 6 }: ChatListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const previewWide = i % 3 !== 2;
        return (
          <li className="chat-item chat-item--skeleton" aria-hidden="true" key={i}>
            <div className="chat-item__avatar-wrap">
              <span className="skeleton skeleton--avatar" />
            </div>
            <div className="chat-item__body">
              <div className="chat-item__top">
                <span className="skeleton skeleton--line skeleton--name" />
                <span className="skeleton skeleton--line skeleton--time" />
              </div>
              <div className="chat-item__bottom">
                <span
                  className={`skeleton skeleton--line skeleton--preview${
                    previewWide ? " skeleton--preview-wide" : ""
                  }`}
                />
              </div>
            </div>
          </li>
        );
      })}
    </>
  );
}
