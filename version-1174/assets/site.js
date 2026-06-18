(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        var showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    var fillSelect = function (select, values) {
        if (!select) {
            return;
        }
        values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        }).forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var section = panel.parentElement || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-search-card]'));
        var input = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var type = panel.querySelector('[data-type-filter]');
        var region = panel.querySelector('[data-region-filter]');
        var years = [];
        var types = [];
        var regions = [];

        cards.forEach(function (card) {
            if (card.dataset.year && years.indexOf(card.dataset.year) === -1) {
                years.push(card.dataset.year);
            }
            if (card.dataset.type && types.indexOf(card.dataset.type) === -1) {
                types.push(card.dataset.type);
            }
            if (card.dataset.region && regions.indexOf(card.dataset.region) === -1) {
                regions.push(card.dataset.region);
            }
        });

        fillSelect(year, years);
        fillSelect(type, types);
        fillSelect(region, regions);

        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var regionValue = region ? region.value : '';

            cards.forEach(function (card) {
                var searchable = (card.dataset.search || '').toLowerCase();
                var matched = true;

                if (query && searchable.indexOf(query) === -1) {
                    matched = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    matched = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
            });
        };

        [input, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    document.querySelectorAll('[data-rail]').forEach(function (rail) {
        var wrap = rail.parentElement;
        var prev = wrap ? wrap.querySelector('[data-rail-prev]') : null;
        var next = wrap ? wrap.querySelector('[data-rail-next]') : null;
        var move = function (direction) {
            rail.scrollBy({
                left: direction * Math.max(260, rail.clientWidth * 0.72),
                behavior: 'smooth'
            });
        };

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
            });
        }
    });

    var video = document.querySelector('.video-player');
    var playButton = document.querySelector('[data-play-button]');
    var hlsInstance = null;
    var streamReady = false;

    var startVideo = function () {
        if (!video) {
            return;
        }

        var source = video.dataset.stream;

        if (!source) {
            return;
        }

        var play = function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        };

        if (!streamReady) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                streamReady = true;
                play();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    streamReady = true;
                    play();
                });
            } else {
                video.src = source;
                streamReady = true;
                play();
            }
        } else {
            play();
        }
    };

    if (video && playButton) {
        playButton.addEventListener('click', startVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });
        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && playButton) {
                playButton.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
})();
