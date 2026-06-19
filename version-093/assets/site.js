(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
      });
    }
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 6500);
  }

  function valueOf(selector) {
    var node = document.querySelector(selector);
    return node ? node.value.trim().toLowerCase() : '';
  }

  function runFilter() {
    var text = valueOf('[data-filter-text]');
    var year = valueOf('[data-filter-year]');
    var region = valueOf('[data-filter-region]');
    var type = valueOf('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title || '',
        card.dataset.year || '',
        card.dataset.region || '',
        card.dataset.type || '',
        card.dataset.genre || '',
        card.dataset.tags || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var okText = !text || haystack.indexOf(text) !== -1;
      var okYear = !year || (card.dataset.year || '').toLowerCase() === year;
      var okRegion = !region || (card.dataset.region || '').toLowerCase() === region;
      var okType = !type || (card.dataset.type || '').toLowerCase() === type;
      card.classList.toggle('hidden-card', !(okText && okYear && okRegion && okType));
    });
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    filterPanel.addEventListener('input', runFilter);
    filterPanel.addEventListener('change', runFilter);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var textInput = document.querySelector('[data-filter-text]');
    if (q && textInput) {
      textInput.value = q;
    }
    runFilter();
  }

  function activatePlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream') || '';
    var started = false;

    function start() {
      if (!streamUrl) {
        return;
      }
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        started = true;
      }
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(activatePlayer);
})();
