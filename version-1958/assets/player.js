(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var panel = document.querySelector("[data-player]");
        if (!panel) {
            return;
        }

        var video = panel.querySelector("video");
        var button = panel.querySelector(".player-cover");
        var stream = panel.getAttribute("data-stream-url");
        var attached = false;
        var waitingPlay = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !video || !stream) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (waitingPlay) {
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.src = stream;
            }
        }

        function startVideo() {
            waitingPlay = true;
            attachStream();
            if (button) {
                button.classList.add("is-hidden");
            }
            video.play().catch(function () {
                setTimeout(function () {
                    video.play().catch(function () {});
                }, 500);
            });
        }

        if (button) {
            button.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
