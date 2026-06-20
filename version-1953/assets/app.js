(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function toggleMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function mountHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
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
        show(0);
        restart();
    }

    function mountCatalog() {
        var cards = selectAll("[data-movie-card]");
        if (!cards.length) {
            return;
        }
        var searchInput = document.querySelector("[data-search-input]");
        var heroSearch = document.querySelector("[data-hero-search]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var countBox = document.querySelector("[data-results-count]");
        var empty = document.querySelector("[data-empty-state]");

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && normalize(card.dataset.type) !== type) {
                    matched = false;
                }
                if (region && normalize(card.dataset.region) !== region) {
                    matched = false;
                }
                if (year && normalize(card.dataset.year) !== year) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countBox) {
                countBox.textContent = visible ? "当前显示 " + visible + " 部影片" : "当前没有匹配结果";
            }
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        if (heroSearch && searchInput) {
            heroSearch.addEventListener("input", function () {
                searchInput.value = heroSearch.value;
                applyFilters();
            });
            heroSearch.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    var catalog = document.getElementById("catalog");
                    if (catalog) {
                        catalog.scrollIntoView({ behavior: "smooth" });
                    }
                }
            });
        }
        applyFilters();
    }

    function handleMissingImages() {
        selectAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });
    }

    function mountPlayerById(id, url) {
        var card = document.getElementById(id);
        if (!card) {
            return;
        }
        var video = card.querySelector("video");
        var button = card.querySelector("[data-player-button]");
        var loader = null;
        var ready = false;

        function load() {
            return new Promise(function (resolve) {
                if (ready) {
                    resolve();
                    return;
                }
                ready = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    resolve();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    loader = new Hls();
                    loader.loadSource(url);
                    loader.attachMedia(video);
                    loader.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    loader.on(Hls.Events.ERROR, function () {
                        resolve();
                    });
                    return;
                }
                video.src = url;
                resolve();
            });
        }

        function start() {
            if (button) {
                button.classList.add("is-hidden");
            }
            load().then(function () {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!ready) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (loader) {
                loader.destroy();
            }
        });
    }

    window.SitePlayer = {
        mount: mountPlayerById
    };

    document.addEventListener("DOMContentLoaded", function () {
        toggleMenu();
        mountHero();
        mountCatalog();
        handleMissingImages();
    });
})();
