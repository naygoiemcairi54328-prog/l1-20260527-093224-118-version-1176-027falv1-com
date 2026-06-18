(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5800);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var input = document.querySelector('[data-search-input]');
  var clear = document.querySelector('[data-search-clear]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var empty = document.querySelector('[data-empty]');
  var activeFilter = 'all';

  function applyFilter() {
    var query = input ? input.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var genre = card.getAttribute('data-genre') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedFilter = activeFilter === 'all' || genre === activeFilter;
      var matched = matchedText && matchedFilter;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  if (clear && input) {
    clear.addEventListener('click', function () {
      input.value = '';
      input.focus();
      applyFilter();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter') || 'all';
      chips.forEach(function (item) {
        item.classList.toggle('active', item === chip);
      });
      applyFilter();
    });
  });
})();
