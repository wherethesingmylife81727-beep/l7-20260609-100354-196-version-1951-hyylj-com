(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-button");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filterForm = document.querySelector("[data-filter-form]");
        if (filterForm) {
            var keywordInput = filterForm.querySelector("[data-filter-keyword]");
            var categorySelect = filterForm.querySelector("[data-filter-category]");
            var yearSelect = filterForm.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var emptyTip = document.querySelector(".empty-tip");

            function filterCards() {
                var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
                var category = categorySelect ? categorySelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var categoryOk = !category || card.getAttribute("data-category") === category;
                    var yearOk = !year || card.getAttribute("data-year") === year;
                    var keywordOk = !keyword || text.indexOf(keyword) !== -1;
                    var show = categoryOk && yearOk && keywordOk;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (emptyTip) {
                    emptyTip.style.display = visible ? "none" : "block";
                }
            }

            filterForm.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards();
            });
            [keywordInput, categorySelect, yearSelect].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", filterCards);
                    item.addEventListener("change", filterCards);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && keywordInput) {
                keywordInput.value = query;
            }
            filterCards();
        }

        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("cover-hidden");
            });
        });
    });
})();
