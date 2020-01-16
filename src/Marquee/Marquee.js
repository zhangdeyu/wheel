(function(global, factory){
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global = global || self;
    global.Marquee = factory();
  }
})(this, function() {
  var utils = {
    isObject: function(obj) {
      return typeof obj === 'function' && obj !== null;
    },
    deepClone: function(source) {
      if (!this.isObject(source)) {
        return source;
      }
      var obj = {};
      for (var k in source) {
        if (source.hasOwnProperty(k)) {
          obj[k] = this.deepClone(source[k]);
        }
      }

      return obj;
    },
    merge: function (source, target) {
      var obj = this.deepClone(source);
      for(var k in target) {
        if (target.hasOwnProperty(k)) {
          obj[k] = this.deepClone(target[k]);
        }
      }

      return obj;
    },
  };

  function Marquee(options) {
    var defaultOptions = {
      el: '.marquee',
      // 间隔ms
      duration: 2
    }

    this.options = utils.merge(defaultOptions, options)
    this.container = this.getContainer()
    this.setStyle()
    this.appendChild()
    this.animation()
  }

  Marquee.prototype.getContainer = function () {
    return document.querySelector(this.options.el)
  }

  Marquee.prototype.appendChild = function () {
    var el = this.container.children[0];
    this.container.appendChild(el.cloneNode(true));
  }

  Marquee.prototype.animation = function() {
    var offset = this.container.children[0].clientHeight;
    var count = this.container.childNodes.length;
    var index = 0;
    var duration = .5

    setInterval(() => {
      this.setStyle(- index * offset, duration);
      index++;
      if (index == count) {
        setTimeout(() => {
          this.setStyle(0, '0');
          index = 1;
        }, duration * 1000);
      }
    }, this.options.duration * 1000);
  }

  Marquee.prototype.setStyle = function(y, duration) {
    y = y || '0';
    this.container.setAttribute('style', 'transition: transform ease-in-out ' + duration +'s; transform: translate3d(0, ' + y +'px, 0)');
  }

  return Marquee;
})