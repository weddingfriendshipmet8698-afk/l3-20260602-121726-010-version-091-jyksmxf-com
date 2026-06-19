function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 28) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  document.querySelectorAll(".mobile-link").forEach(function (link) {
    link.addEventListener("click", function () {
      body.classList.remove("menu-open");
    });
  });

  initHero();
  initCardFilters();
  initRankSearch();
  initPlayers();
});

function initHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var previous = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  if (previous) {
    previous.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      restart();
    });
  });

  show(0);
  restart();
}

function initCardFilters() {
  var searchInput = document.querySelector("[data-card-search]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

  if (!cards.length) {
    return;
  }

  function apply() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute("data-year") === year;
      var matchType = !type || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
    });
  }

  [searchInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    }
  });
}

function initRankSearch() {
  var input = document.querySelector("[data-rank-search]");
  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-rank-list] .rank-row"));

  if (!input || !rows.length) {
    return;
  }

  input.addEventListener("input", function () {
    var query = input.value.trim().toLowerCase();
    rows.forEach(function (row) {
      var haystack = (row.getAttribute("data-search") || "").toLowerCase();
      row.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
    });
  });
}

function initPlayers() {
  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    var stream = player.getAttribute("data-stream");
    var hasLoaded = false;
    var hlsInstance = null;

    if (!video || !button || !stream) {
      return;
    }

    function load() {
      if (hasLoaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        hasLoaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hasLoaded = true;
        return;
      }

      video.src = stream;
      hasLoaded = true;
    }

    function start() {
      load();
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  });
}
