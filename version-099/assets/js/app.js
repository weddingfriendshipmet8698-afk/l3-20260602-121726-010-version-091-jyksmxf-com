(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var input = panel.querySelector("[data-filter-input]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var categorySelect = panel.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var empty = section.querySelector("[data-empty-state]");

      function yearMatches(cardYear, selectedYear) {
        if (!selectedYear) {
          return true;
        }
        if (selectedYear === "2019") {
          var parsed = parseInt(cardYear, 10);
          return !parsed || parsed <= 2019;
        }
        return cardYear === selectedYear;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value : "";
        var yearValue = yearSelect ? yearSelect.value : "";
        var categoryValue = categorySelect ? categorySelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var ok = true;
          ok = ok && (!query || text.indexOf(query) !== -1);
          ok = ok && (!typeValue || cardType === typeValue);
          ok = ok && yearMatches(cardYear, yearValue);
          ok = ok && (!categoryValue || cardCategory === categoryValue);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryParam = params.get("q");
      if (queryParam && input) {
        input.value = queryParam;
      }
      apply();
    });
  }

  function attachStream(video, stream, status) {
    if (video.dataset.ready === "1") {
      return;
    }

    video.dataset.ready = "1";
    if (status) {
      status.textContent = "影片加载中";
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      if (status) {
        status.textContent = "";
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (status) {
          status.textContent = "";
        }
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal && status) {
          status.textContent = "播放加载失败，请稍后重试";
        }
      });
      video._hlsPlayer = hls;
      return;
    }

    video.src = stream;
    if (status) {
      status.textContent = "";
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var button = player.querySelector("[data-play]");
      var status = player.querySelector("[data-player-status]");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");

      function start() {
        if (!stream) {
          if (status) {
            status.textContent = "播放加载失败，请稍后重试";
          }
          return;
        }
        attachStream(video, stream, status);
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
            if (status) {
              status.textContent = "点击播放按钮继续观看";
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
