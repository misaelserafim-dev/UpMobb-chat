/**
 * FiltersCarousel — Embla Carousel (vanilla)
 * No React: useEmblaCarousel(options) com a mesma estrutura HTML/CSS
 * https://www.embla-carousel.com/get-started/react/
 */
import EmblaCarousel from "https://cdn.jsdelivr.net/npm/embla-carousel@8.5.2/+esm";

const OPTIONS = {
  align: "start",
  dragFree: true,
  containScroll: "trimSnaps",
};

/**
 * @returns {import('embla-carousel').EmblaCarouselType | null}
 */
export function initFiltersCarousel(root = document) {
  const wrapper = root.querySelector("#filters-carousel");
  const viewport = wrapper?.querySelector(".embla__viewport");
  if (!wrapper || !viewport) return null;

  const prevBtn = wrapper.querySelector(".embla__prev");
  const nextBtn = wrapper.querySelector(".embla__next");
  const embla = EmblaCarousel(viewport, OPTIONS);

  const syncButtons = () => {
    const canPrev = embla.canScrollPrev();
    const canNext = embla.canScrollNext();

    if (prevBtn) {
      prevBtn.disabled = !canPrev;
      prevBtn.classList.toggle("is-hidden", !canPrev);
    }
    if (nextBtn) {
      nextBtn.disabled = !canNext;
      nextBtn.classList.toggle("is-hidden", !canNext);
    }

    wrapper.classList.toggle("can-scroll-prev", canPrev);
    wrapper.classList.toggle("can-scroll-next", canNext);
  };

  prevBtn?.addEventListener("click", () => embla.scrollPrev(), false);
  nextBtn?.addEventListener("click", () => embla.scrollNext(), false);
  embla.on("select", syncButtons);
  embla.on("reInit", syncButtons);
  embla.on("scroll", syncButtons);
  syncButtons();

  return embla;
}
