(() => {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  };

  if (slides.length) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index));
    });

    showSlide(0);

    window.setInterval(() => {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const params = new URLSearchParams(window.location.search);
  const queryInput = document.querySelector("[data-search-input]");
  const cards = Array.from(document.querySelectorAll("[data-search]"));
  const empty = document.querySelector("[data-no-result]");

  const applyFilter = (value) => {
    const keyword = value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const content = (card.getAttribute("data-search") || "").toLowerCase();
      const matched = !keyword || content.includes(keyword);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };

  if (queryInput && cards.length) {
    const initialQuery = params.get("q") || "";
    queryInput.value = initialQuery;
    applyFilter(initialQuery);

    queryInput.addEventListener("input", () => {
      applyFilter(queryInput.value);
    });
  }
})();
