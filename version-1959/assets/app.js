(function () {
  var mobileButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', String(isOpen));
      mobileButton.textContent = isOpen ? '×' : '☰';
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilterPanel(panel) {
    var targetSelector = panel.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) {
      return;
    }

    var searchInput = panel.querySelector('.page-search-input');
    var countNode = panel.querySelector('.filter-count');
    var activeFilters = {};
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card, .full-rank-row'));

    if (panel.getAttribute('data-search-from-query') === 'true' && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        var searchText = normalize(card.getAttribute('data-search'));

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        Object.keys(activeFilters).forEach(function (field) {
          var value = activeFilters[field];
          if (!value) {
            return;
          }
          var cardValue = normalize(card.getAttribute('data-' + field));
          if (cardValue.indexOf(normalize(value)) === -1) {
            matched = false;
          }
        });

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = visible ? '已筛选到 ' + visible + ' 部内容' : '未找到匹配内容';
      }
    }

    panel.querySelectorAll('.filter-chip').forEach(function (button) {
      button.addEventListener('click', function () {
        var field = button.getAttribute('data-filter-field');
        var value = button.getAttribute('data-filter-value') || '';
        var group = button.closest('.filter-chips');

        if (group) {
          group.querySelectorAll('.filter-chip').forEach(function (chip) {
            chip.classList.remove('is-active');
          });
        }

        button.classList.add('is-active');
        if (field) {
          activeFilters[field] = value;
        }
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    applyFilters();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(initFilterPanel);
  }

  function initPlayers() {
    document.querySelectorAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.play-overlay');
      var url = shell.getAttribute('data-video-url');
      var hls = null;
      var ready = false;

      if (!video || !url) {
        return;
      }

      function bindVideo() {
        if (ready) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }

        ready = true;
      }

      function playVideo() {
        bindVideo();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initScrollPlayerButtons() {
    document.querySelectorAll('[data-scroll-player]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var player = document.querySelector('.video-shell');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var overlay = player.querySelector('.play-overlay');
          if (overlay) {
            overlay.focus({ preventScroll: true });
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroCarousel();
    initFilters();
    initPlayers();
    initScrollPlayerButtons();
  });
}());
