(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open", !expanded);
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var filterInputs = document.querySelectorAll(".filter-input[data-search-target]");

  filterInputs.forEach(function (input) {
    var selector = input.getAttribute("data-search-target");
    var cards = Array.prototype.slice.call(document.querySelectorAll(selector));

    input.addEventListener("input", function () {
      var query = normalize(input.value);

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    });
  });

  var chipGroups = document.querySelectorAll(".filter-chips[data-filter-target]");

  chipGroups.forEach(function (group) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(group.getAttribute("data-filter-target")));
    var field = group.getAttribute("data-filter-field") || "kind";

    group.addEventListener("click", function (event) {
      var button = event.target.closest(".filter-chip");

      if (!button) {
        return;
      }

      group.querySelectorAll(".filter-chip").forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      var filter = button.getAttribute("data-filter");

      cards.forEach(function (card) {
        var value = card.getAttribute("data-" + field) || "";
        var match = filter === "all" || value.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;
  var timer = null;

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

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot") || 0);
      showSlide(index);

      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }

      startHero();
    });
  });

  showSlide(0);
  startHero();

  function requestPlay(video, box) {
    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        box.classList.remove("is-playing");
      });
    }
  }

  function loadVideo(video, ready) {
    var url = video.getAttribute("data-stream");

    if (!url) {
      return;
    }

    if (video.getAttribute("data-ready") === "1") {
      ready();
      return;
    }

    video.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", ready, { once: true });
      video.load();
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.on(window.Hls.Events.MANIFEST_PARSED, ready);
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = url;
      video.addEventListener("loadedmetadata", ready, { once: true });
      video.load();
    }
  }

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-layer");

    if (!video) {
      return;
    }

    function play() {
      box.classList.add("is-playing");
      loadVideo(video, function () {
        requestPlay(video, box);
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
  });

  document.querySelectorAll("[data-start-player]").forEach(function (button) {
    button.addEventListener("click", function () {
      var box = document.querySelector("[data-player]");

      if (!box) {
        return;
      }

      var layer = box.querySelector(".player-layer");
      box.scrollIntoView({ behavior: "smooth", block: "center" });

      if (layer) {
        layer.click();
      }
    });
  });
})();
