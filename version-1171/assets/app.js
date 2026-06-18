var MovieSite = (function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initFilter() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
            var area = document.querySelector("[data-card-area]");
            if (!area) {
                return;
            }
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            var activeFilter = "all";

            function apply() {
                var term = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var category = card.getAttribute("data-category") || "";
                    var keywordMatch = !term || text.indexOf(term) !== -1;
                    var categoryMatch = activeFilter === "all" || category === activeFilter;
                    card.classList.toggle("hidden", !(keywordMatch && categoryMatch));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayer(streamUrl) {
        ready(function () {
            var shell = document.querySelector("[data-player]");
            if (!shell) {
                return;
            }
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            var loaded = false;
            var hls = null;

            function startVideo() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            function load() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                if (loaded) {
                    startVideo();
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", startVideo, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
                    return;
                }
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", startVideo, { once: true });
                video.load();
            }

            if (overlay) {
                overlay.addEventListener("click", load);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    load();
                } else if (video.paused) {
                    startVideo();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilter();
    });

    return {
        initPlayer: initPlayer
    };
})();
