(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var root = panel.closest("section") || document;
      var input = panel.querySelector("[data-page-search]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-select-filter]"));
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var count = root.querySelector("[data-result-count]");
      var noResult = root.querySelector("[data-no-result]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var term = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var matched = normalize(card.dataset.search).indexOf(term) !== -1;
          selects.forEach(function (select) {
            var key = select.getAttribute("data-select-filter");
            var expected = normalize(select.value);
            if (expected && normalize(card.getAttribute(key)) !== expected) {
              matched = false;
            }
          });
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }
        if (noResult) {
          noResult.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    script.async = true;
    script.dataset.hlsLoader = "true";
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    var total = Math.floor(seconds);
    var minutes = Math.floor(total / 60);
    var rest = String(total % 60).padStart(2, "0");
    return minutes + ":" + rest;
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var progress = player.querySelector("[data-progress]");
      var time = player.querySelector("[data-time]");
      var playButtons = player.querySelectorAll("[data-play-toggle]");
      var muteButton = player.querySelector("[data-mute-toggle]");
      var fullscreenButton = player.querySelector("[data-fullscreen]");
      var hlsInstance = null;
      var sourceAttached = false;

      if (!video) {
        return;
      }

      function attachSource() {
        if (sourceAttached) {
          return;
        }
        sourceAttached = true;
        var source = video.dataset.src;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = source;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function ensureSourceThen(action) {
        if (window.Hls || video.canPlayType("application/vnd.apple.mpegurl")) {
          attachSource();
          action();
          return;
        }
        loadHls(function () {
          attachSource();
          action();
        });
      }

      function togglePlay() {
        ensureSourceThen(function () {
          if (video.paused) {
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
              playPromise.catch(function () {});
            }
          } else {
            video.pause();
          }
        });
      }

      playButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          togglePlay();
        });
      });

      player.addEventListener("click", function (event) {
        if (event.target.closest("button") || event.target.closest("input") || event.target.closest("a")) {
          return;
        }
        togglePlay();
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        playButtons.forEach(function (button) {
          if (button.classList.contains("big-play")) {
            button.textContent = "❚❚";
          } else {
            button.textContent = "暂停";
          }
        });
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
        playButtons.forEach(function (button) {
          if (button.classList.contains("big-play")) {
            button.textContent = "▶";
          } else {
            button.textContent = "播放";
          }
        });
      });

      video.addEventListener("timeupdate", function () {
        if (progress && video.duration) {
          progress.value = String((video.currentTime / video.duration) * 100);
        }
        if (time) {
          time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
        }
      });

      video.addEventListener("loadedmetadata", function () {
        if (time) {
          time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
        }
      });

      if (progress) {
        progress.addEventListener("input", function () {
          if (video.duration) {
            video.currentTime = (Number(progress.value) / 100) * video.duration;
          }
        });
      }

      if (muteButton) {
        muteButton.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupFilters();
    setupPlayers();
  });
})();
