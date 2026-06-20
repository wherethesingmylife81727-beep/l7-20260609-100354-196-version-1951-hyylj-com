(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            active = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((active + 1) % slides.length);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterScope = document.querySelector('[data-filter-scope]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && filterScope) {
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));

        function applyFilter() {
            var keyword = filterInput.value.trim().toLowerCase();
            var year = filterYear ? filterYear.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        filterInput.addEventListener('input', applyFilter);

        if (filterYear) {
            filterYear.addEventListener('change', applyFilter);
        }
    }
})();
