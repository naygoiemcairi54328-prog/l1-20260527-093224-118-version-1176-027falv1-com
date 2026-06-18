(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchList = document.querySelector('[data-search-list]');

    if (searchInput && searchList) {
        var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            var keyword = normalize(searchInput.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        }

        searchInput.value = initial;
        searchInput.addEventListener('input', filterCards);
        filterCards();
    }

    var videos = Array.prototype.slice.call(document.querySelectorAll('.js-hls-video'));

    videos.forEach(function (video) {
        var streamUrl = video.getAttribute('data-src');
        var box = video.closest('[data-player-box]');
        var button = box ? box.querySelector('[data-play-button]') : null;
        var ready = false;

        function prepareVideo() {
            if (ready || !streamUrl) {
                return;
            }

            ready = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            prepareVideo();
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (box) {
                box.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', function () {
            prepareVideo();
        });

        if (button) {
            button.addEventListener('click', playVideo);
        }
    });
})();
