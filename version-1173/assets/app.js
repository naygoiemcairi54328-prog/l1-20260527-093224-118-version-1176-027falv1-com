(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = $('.menu-toggle');
    var menu = $('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindHero() {
    var hero = $('.hero-slider');
    if (!hero) return;
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot');
    var prev = $('.hero-arrow.prev');
    var next = $('.hero-arrow.next');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindFilters() {
    var form = $('.filter-bar');
    var grid = $('.filter-grid');
    if (!form || !grid) return;
    var input = $('[name="q"]', form);
    var region = $('[name="region"]', form);
    var type = $('[name="type"]', form);
    var year = $('[name="year"]', form);
    var empty = $('.filter-empty');
    var cards = $all('.movie-card', grid);
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) input.value = params.get('q');

    function filter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (q && card.getAttribute('data-search').indexOf(q) === -1) ok = false;
        if (regionValue && card.getAttribute('data-region') !== regionValue) ok = false;
        if (typeValue && card.getAttribute('data-type') !== typeValue) ok = false;
        if (yearValue && card.getAttribute('data-year') !== yearValue) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
    [input, region, type, year].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', filter);
      control.addEventListener('change', filter);
    });
    filter();
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !overlay || !streamUrl) return;
    var attached = false;
    var player = null;

    function attach() {
      if (attached) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    window.addEventListener('beforeunload', function () {
      if (player && player.destroy) player.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
}());
