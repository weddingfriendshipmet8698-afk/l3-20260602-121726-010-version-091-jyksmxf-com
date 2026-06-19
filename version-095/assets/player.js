(function () {
    function setup(videoId, sourceUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var attached = false;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);

                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                });
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return Promise.resolve();
            }

            video.src = sourceUrl;
            return Promise.resolve();
        }

        function startPlayback() {
            attachSource().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function () {
                        if (overlay) {
                            overlay.classList.add("is-hidden");
                        }
                    }).catch(function () {
                        if (overlay) {
                            overlay.classList.add("is-hidden");
                        }
                    });
                } else if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.SitePlayer = {
        setup: setup
    };
})();
