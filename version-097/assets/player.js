export function startPlayer(config, Hls) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var button = document.getElementById(config.buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !config.source) {
        return;
    }

    function loadSource() {
        if (ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = config.source;
            ready = true;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(config.source);
            hlsInstance.attachMedia(video);
            ready = true;
            return;
        }

        video.src = config.source;
        ready = true;
    }

    function playVideo() {
        loadSource();
        if (overlay) {
            overlay.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}
