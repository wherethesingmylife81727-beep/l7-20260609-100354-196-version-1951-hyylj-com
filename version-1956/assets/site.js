(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card-list] .movie-card'));
      var input = panel.querySelector('[data-search-input]');
      var category = panel.querySelector('[data-category-filter]');
      var year = panel.querySelector('[data-year-filter]');

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : '';
        var yearValue = year ? year.value : '';

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
        });
      }

      [input, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      if (!video || !button) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      function begin() {
        if (!streamUrl) {
          return;
        }
        shell.classList.add('is-playing');
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              started = false;
              shell.classList.remove('is-playing');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        } else {
          shell.classList.remove('is-playing');
        }
      }

      button.addEventListener('click', begin);
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
