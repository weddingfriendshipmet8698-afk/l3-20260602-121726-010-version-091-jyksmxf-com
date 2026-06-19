(function () {
  function attachSource(video, source) {
    if (!source) {
      return Promise.reject(new Error('empty source'));
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const overlay = player.querySelector('[data-player-overlay]');
    const source = video ? video.dataset.source : '';
    let ready = false;

    function play() {
      if (!video) {
        return;
      }

      const start = ready ? Promise.resolve() : attachSource(video, source).then(function () {
        ready = true;
      });

      start.then(function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        return video.play();
      }).catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
  });
})();
