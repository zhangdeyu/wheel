(function(root, factory) {
  typeof exports === 'object' && typeof module !== null ? module.exports = factory()
  : typeof define === 'object' && define.amd ? define(factory)
  : (root = root || self, root.Util = factory());
})(window, function() {

  function debounce(fn, wait) {
    var timer = null;
    function debounced () {
      if (timer) {
        clearTimeout(timer)
        timer = null;
      }

      var args = [].slice.call(arguments);
      var _ = this;

      timer = setTimeout(function() {
        fn.apply(_, args);
        clearTimeout(timer)
        timer = null;
      }, wait);
    }

    debounced.cancel = function() {
      clearTimeout(timer)
      timer = null;
    }

    return debounced;
  }

  // 精简版本
  function throttle(fn, wait) {
    var previous = 0;
    function throttled() {
      var now = Date.now();
      if (now - previous >= wait) {
        previous = now;
        fn.apply(this, [].slice.call(arguments));
      }
    }

    throttle.cancel = function() {
      previous = 0;
    }

    return throttled;
  }


  var Util = {
    throttle: throttle,
    debounce: debounce
  }

  return Util;
})