(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var catalog = window.MovieCatalog || [];
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(input) {
    var box = input.closest('.search-box');
    var resultBox = box ? box.querySelector('[data-search-results]') : null;
    if (!resultBox) {
      return;
    }
    var query = normalize(input.value);
    if (!query) {
      resultBox.innerHTML = '';
      resultBox.classList.remove('is-open');
      return;
    }
    var matches = catalog.filter(function(item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(' ')].join(' ');
      return normalize(text).indexOf(query) !== -1;
    }).slice(0, 24);
    resultBox.innerHTML = matches.map(function(item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
        '</a>';
    }).join('');
    resultBox.classList.toggle('is-open', matches.length > 0);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  searchInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      renderSearch(input);
    });
    input.addEventListener('focus', function() {
      renderSearch(input);
    });
  });

  document.addEventListener('click', function(event) {
    searchInputs.forEach(function(input) {
      var box = input.closest('.search-box');
      if (box && !box.contains(event.target)) {
        var resultBox = box.querySelector('[data-search-results]');
        if (resultBox) {
          resultBox.classList.remove('is-open');
        }
      }
    });
  });

  var categorySearch = document.querySelector('[data-category-search]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var categoryCards = Array.prototype.slice.call(document.querySelectorAll('[data-category-list] [data-movie-card]'));

  function filterCategoryCards() {
    var query = normalize(categorySearch ? categorySearch.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';

    categoryCards.forEach(function(card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesYear = !year || card.getAttribute('data-year') === year;
      var matchesType = !type || card.getAttribute('data-type') === type;
      var matchesRegion = !region || card.getAttribute('data-region') === region;
      card.classList.toggle('is-hidden', !(matchesText && matchesYear && matchesType && matchesRegion));
    });
  }

  [categorySearch, yearFilter, typeFilter, regionFilter].forEach(function(control) {
    if (control) {
      control.addEventListener('input', filterCategoryCards);
      control.addEventListener('change', filterCategoryCards);
    }
  });
}());
