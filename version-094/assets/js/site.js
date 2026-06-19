(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let index = 0;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const queryInput = filterForm.querySelector('[name="q"]');
    const yearSelect = filterForm.querySelector('[name="year"]');
    const genreSelect = filterForm.querySelector('[name="genre"]');
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const q = normalize(queryInput ? queryInput.value : '');
      const year = yearSelect ? yearSelect.value : '';
      const genre = genreSelect ? genreSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const matchQuery = !q || haystack.includes(q);
        const matchYear = !year || card.dataset.year === year;
        const matchGenre = !genre || normalize(card.dataset.genre).includes(normalize(genre));
        const matched = matchQuery && matchYear && matchGenre;

        card.classList.toggle('hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    applyFilter();
  }
})();
