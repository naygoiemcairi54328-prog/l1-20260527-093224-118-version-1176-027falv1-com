(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    function prepare() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      prepare();
      overlay.classList.add('is-hidden');
      video.controls = true;

      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
