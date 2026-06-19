(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  };

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    let activeIndex = 0;
    let timer = null;
    const activate = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    };
    const start = () => {
      timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };
    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        activate(index);
        restart();
      });
    });
    activate(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-form]").forEach((form) => {
      const targetSelector = form.getAttribute("data-target") || "#movie-list";
      const target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      const cards = Array.from(target.querySelectorAll("[data-card]"));
      const empty = document.querySelector("[data-empty-state]");
      const run = () => {
        const data = new FormData(form);
        const query = normalize(data.get("q"));
        const category = normalize(data.get("category"));
        const year = normalize(data.get("year"));
        let visible = 0;
        cards.forEach((card) => {
          const text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.category,
            card.dataset.keywords,
          ].join(" "));
          const matchedQuery = !query || text.includes(query);
          const matchedCategory = !category || normalize(card.dataset.category) === category;
          const matchedYear = !year || normalize(card.dataset.year) === year;
          const matched = matchedQuery && matchedCategory && matchedYear;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      form.addEventListener("input", run);
      form.addEventListener("change", run);
      form.addEventListener("reset", () => window.setTimeout(run, 0));
      const params = new URLSearchParams(window.location.search);
      ["q", "category", "year"].forEach((name) => {
        const field = form.elements[name];
        if (field && params.has(name)) {
          field.value = params.get(name) || "";
        }
      });
      run();
    });
  }

  function connectVideo(video, src) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return hls;
    }
    video.src = src;
    return null;
  }

  window.initPlayer = function initPlayer(src) {
    const video = document.getElementById("movie-video");
    const overlay = document.querySelector("[data-play-overlay]");
    if (!video || !overlay || !src) {
      return;
    }
    let loaded = false;
    let hls = null;
    const play = () => {
      if (!loaded) {
        hls = connectVideo(video, src);
        loaded = true;
      }
      overlay.classList.add("is-hidden");
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          overlay.classList.remove("is-hidden");
        });
      }
    };
    overlay.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (!loaded) {
        play();
        return;
      }
      if (video.paused) {
        video.play();
      }
    });
    window.addEventListener("pagehide", () => {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(() => {
    initMenu();
    initHero();
    initFilters();
  });
})();
