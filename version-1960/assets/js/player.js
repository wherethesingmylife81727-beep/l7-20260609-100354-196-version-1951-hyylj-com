(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var stream = video ? video.getAttribute('data-stream') : '';
        var started = false;
        var hls = null;

        function attach() {
            if (!video || !stream || started) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            started = true;
        }

        function play() {
            attach();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (video) {
                video.controls = true;
                var attempt = video.play();

                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
