(function () {
  function each(selector, scope, callback) {
    Array.prototype.forEach.call((scope || document).querySelectorAll(selector), callback);
  }

  function closestCard(element) {
    return element.closest('.movie-card');
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupImageFallbacks() {
    each('img', document, function (img) {
      img.addEventListener('error', function () {
        var frame = img.closest('.poster-frame, .hero-poster, .channel-cover, .rank-cover');
        if (frame) {
          frame.classList.add('poster-empty');
          if (!frame.getAttribute('aria-label')) {
            frame.setAttribute('aria-label', img.getAttribute('alt') || '');
          }
        }
        img.remove();
      }, { once: true });
    });
  }

  function applyFilters(scope) {
    var panel = scope.querySelector('[data-filter-panel]') || scope;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var textInput = panel.querySelector('[data-local-search]') || scope.querySelector('[data-search-page-input]');
    var activeType = '';
    var empty = scope.querySelector('[data-empty-state]');

    function run() {
      var query = normalize(textInput ? textInput.value : '');
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var type = normalize(card.getAttribute('data-type'));
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesType = !activeType || type.indexOf(normalize(activeType)) !== -1;
        var visible = matchesText && matchesType;
        card.classList.toggle('hidden-card', !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener('input', run);
    }

    each('[data-filter-type]', panel, function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        each('[data-filter-type]', panel, function (item) {
          item.classList.toggle('active', item === button);
        });
        run();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && textInput) {
      textInput.value = query;
    }
    run();
  }

  function setupLocalFilters() {
    each('[data-card-list]', document, function (list) {
      var section = list.closest('section') || document;
      applyFilters(section);
    });
  }

  function setupSearchForms() {
    each('.site-search', document, function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function attachStream(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video._hlsPlayer = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function startPlayer(shell) {
    var video = shell.querySelector('.player-video');
    var button = shell.querySelector('[data-play-toggle]');
    if (!video) {
      return;
    }
    if (!video.getAttribute('src')) {
      attachStream(video, video.getAttribute('data-video-url'));
    }
    if (button) {
      button.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function setupPlayers() {
    each('[data-player]', document, function (shell) {
      var button = shell.querySelector('[data-play-toggle]');
      shell.addEventListener('click', function (event) {
        if (event.target && event.target.closest('video')) {
          return;
        }
        startPlayer(shell);
      });
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          startPlayer(shell);
        });
      }
    });
    each('[data-detail-play]', document, function (button) {
      button.addEventListener('click', function () {
        var shell = document.querySelector('[data-player]');
        if (shell) {
          startPlayer(shell);
          shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupImageFallbacks();
    setupSearchForms();
    setupLocalFilters();
    setupPlayers();
  });
}());
