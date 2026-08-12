import { ComponentesPage } from "./pages/ComponentesPage.js";
import { initTheme, applyTheme } from "./theme.js";

initTheme();

document.getElementById("root").innerHTML = ComponentesPage();

document.querySelectorAll("[data-theme-id]").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    const id = swatch.dataset.themeId;
    applyTheme(id);
    document.querySelectorAll("[data-theme-id]").forEach((s) => {
      const on = s.dataset.themeId === id;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-checked", String(on));
    });
  });
});

document.title = "Upmobb | Componentes";
