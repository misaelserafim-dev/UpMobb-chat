
export function ChatListSkeleton({ count = 6 } = {}) {
  return Array.from({ length: count }, (_, i) => ChatListSkeletonItem(i)).join("");
}


export function FiltersCarouselSkeleton({ count = 5 } = {}) {
  const widths = [72, 88, 104, 96, 80, 90];
  return Array.from({ length: count }, (_, i) => {
    const w = widths[i % widths.length];
    return `
      <div class="embla__slide" aria-hidden="true">
        <span
          class="filter-chip filter-chip--skeleton skeleton"
          style="width: ${w}px"
        ></span>
      </div>
    `;
  }).join("");
}

function ChatListSkeletonItem(index) {
  const previewWide = index % 3 !== 2;

  return `
    <li class="chat-item chat-item--skeleton" aria-hidden="true">
      <div class="chat-item__avatar-wrap">
        <span class="skeleton skeleton--avatar"></span>
      </div>
      <div class="chat-item__body">
        <div class="chat-item__top">
          <span class="skeleton skeleton--line skeleton--name"></span>
          <span class="skeleton skeleton--line skeleton--time"></span>
        </div>
        <div class="chat-item__bottom">
          <span class="skeleton skeleton--line skeleton--preview ${previewWide ? "skeleton--preview-wide" : ""}"></span>
        </div>
      </div>
    </li>
  `;
}
