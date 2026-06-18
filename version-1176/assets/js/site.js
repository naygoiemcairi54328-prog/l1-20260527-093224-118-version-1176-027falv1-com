(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
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
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilters() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var empty = document.querySelector("[data-empty-message]");
        if (cards.length === 0) {
            return;
        }
        var activeFilter = "all";
        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }
        function apply() {
            var query = input ? normalize(input.value) : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var type = card.getAttribute("data-type") || "";
                var tags = (card.getAttribute("data-tags") || "") + " " + (card.getAttribute("data-genre") || "");
                var matchesText = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || tags.indexOf(activeFilter) !== -1;
                var shouldShow = matchesText && matchesFilter;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeFilter = button.getAttribute("data-filter") || "all";
                apply();
            });
        });
        apply();
    }

    function loadHlsLibrary(done) {
        if (window.Hls) {
            done();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", done, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", done, { once: true });
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("mainPlayer");
        var overlay = document.getElementById("playButton");
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var started = false;
        function startPlayback() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            overlay.classList.add("is-hidden");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }
            loadHlsLibrary(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            });
        }
        overlay.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!started) {
                startPlayback();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
