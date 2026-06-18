(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    var search = document.querySelector(".site-search");
    if (!toggle || !nav || !search) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    function show(nextIndex) {
      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll("form.site-search"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupSearchPage() {
    var grid = document.querySelector("[data-search-grid]");
    var form = document.querySelector(".search-page-form");
    if (!grid || !form) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }
    function filter(value) {
      var key = (value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        if (!key || text.indexOf(key) !== -1) {
          card.classList.remove("is-filtered-out");
        } else {
          card.classList.add("is-filtered-out");
        }
      });
    }
    filter(q);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input ? input.value : "";
      var url = value.trim() ? "./search.html?q=" + encodeURIComponent(value.trim()) : "./search.html";
      window.history.replaceState(null, "", url);
      filter(value);
    });
    if (input) {
      input.addEventListener("input", function () {
        filter(input.value);
      });
    }
  }

  function setupPlayer() {
    Array.prototype.forEach.call(document.querySelectorAll(".player-box"), function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");
      var url = box.getAttribute("data-video");
      var started = false;
      var hlsInstance = null;
      if (!video || !url) {
        return;
      }
      function begin() {
        if (button) {
          button.classList.add("is-hidden");
        }
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = url;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupSearchPage();
    setupPlayer();
  });
})();
