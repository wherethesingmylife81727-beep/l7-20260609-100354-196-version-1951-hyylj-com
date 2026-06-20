(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.getElementById("mobile-menu-button");
        var mobileMenu = document.getElementById("mobile-menu");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                var open = mobileMenu.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
                menuButton.textContent = open ? "×" : "☰";
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === active);
            });
        }

        function queue() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(active + 1);
                }, 5600);
            }
        }

        if (slides.length) {
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    queue();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(active - 1);
                    queue();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(active + 1);
                    queue();
                });
            }
            showSlide(0);
            queue();
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var grid = document.querySelector("[data-filter-grid]");
            if (!grid) {
                return;
            }
            var searchInput = document.getElementById("search-input") || document.querySelector("[data-filter-input]");
            var categoryFilter = document.getElementById("category-filter");
            var typeFilter = document.getElementById("type-filter");
            var yearFilter = document.getElementById("year-filter");
            var keyword = normalize(searchInput ? searchInput.value : "");
            var category = normalize(categoryFilter ? categoryFilter.value : "");
            var type = normalize(typeFilter ? typeFilter.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                card.classList.toggle("is-filtered", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            var empty = document.querySelector("[data-empty-state]");
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        var searchParams = new URLSearchParams(window.location.search);
        var initialQuery = searchParams.get("q");
        var searchInput = document.getElementById("search-input");
        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        ["search-input", "category-filter", "type-filter", "year-filter"].forEach(function (id) {
            var element = document.getElementById(id);
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
            input.addEventListener("input", applyFilter);
        });

        applyFilter();
    });
}());
