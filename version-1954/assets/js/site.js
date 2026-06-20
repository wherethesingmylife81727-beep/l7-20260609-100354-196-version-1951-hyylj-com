(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-filter-list]").forEach(function (area) {
            var input = document.querySelector("[data-filter-input]");
            var region = document.querySelector("[data-filter-region]");
            var type = document.querySelector("[data-filter-type]");
            var year = document.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));

            function apply() {
                var q = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;

                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                });
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });

        var focusCards = Array.prototype.slice.call(document.querySelectorAll(".hero-focus-card"));
        if (focusCards.length > 1) {
            var active = 0;
            setInterval(function () {
                focusCards[active].classList.remove("is-current");
                active = (active + 1) % focusCards.length;
                focusCards[active].classList.add("is-current");
            }, 3600);
        }

        document.querySelectorAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var play = shell.querySelector(".play-cover");
            var stream = shell.getAttribute("data-stream");
            var bound = false;

            function bind() {
                if (bound || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                bound = true;
            }

            function start() {
                bind();
                shell.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            if (play) {
                play.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
            }
        });

        var searchRoot = document.querySelector("[data-search-page]");
        if (searchRoot && window.SITE_MOVIES) {
            var params = new URLSearchParams(window.location.search);
            var input = searchRoot.querySelector("[data-search-input]");
            var region = searchRoot.querySelector("[data-search-region]");
            var type = searchRoot.querySelector("[data-search-type]");
            var results = searchRoot.querySelector("[data-search-results]");
            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function card(movie) {
                var tags = movie.tags.slice(0, 3).map(function (tag) {
                    return "<span class=\"chip\">" + escapeHtml(tag) + "</span>";
                }).join("");

                return "" +
                    "<a class=\"movie-card\" href=\"" + movie.url + "\">" +
                        "<div class=\"poster\">" +
                            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                            "<span class=\"duration-pill\">" + movie.duration + "</span>" +
                            "<span class=\"play-dot\">▶</span>" +
                        "</div>" +
                        "<div class=\"card-body\">" +
                            "<h2 class=\"card-title\">" + escapeHtml(movie.title) + "</h2>" +
                            "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
                            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                            "<div class=\"tags\" style=\"margin-top: 12px;\">" + tags + "</div>" +
                        "</div>" +
                    "</a>";
            }

            function escapeHtml(value) {
                return String(value || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }

            function render() {
                var q = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var filtered = window.SITE_MOVIES.filter(function (movie) {
                    var text = normalize(movie.title + " " + movie.oneLine + " " + movie.genre + " " + movie.tags.join(" "));
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (regionValue && normalize(movie.region).indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    if (typeValue && normalize(movie.type) !== typeValue) {
                        ok = false;
                    }
                    return ok;
                }).slice(0, 120);

                if (!filtered.length) {
                    results.innerHTML = "<div class=\"empty-state\">没有匹配结果，换个关键词试试。</div>";
                    return;
                }
                results.innerHTML = "<div class=\"movie-grid\">" + filtered.map(card).join("") + "</div>";
            }

            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", render);
                    control.addEventListener("change", render);
                }
            });
            render();
        }
    });
}());
