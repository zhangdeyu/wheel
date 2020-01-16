(function(root, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
  : typeof define === 'function' && define.amd ? define(factory)
  : (global = root || self, global.Slides = factory())
})(this, function() {
  var utils = {
    isObject: function(obj) {
      return typeof obj === 'object' && obj !== null;
    },
    deepClone: function(source) {
      if (!this.isObject(source)) {
        return source;
      }
      var obj = {};
      for(var key in source) {
        if (source.hasOwnProperty(key)) {
          obj[key] = this.deepClone(source[key]);
        }
      }

      return obj;
    },
    merge: function(source, target) {
      var obj = this.deepClone(source);
      for (var key in target) {
        if (target.hasOwnProperty(key)) {
          obj[key] = this.deepClone(target[key])
        }
      }

      return obj;
    },
    obj2Style: function(obj) {
      var style = '';
      for (var key in obj) {
        style = style + key + ':' + obj[key] + ';'
      }

      return style;
    }
  }
  function Slides(options) {
    var defaultOptions = {
      el: '#slides'
    }

    this.options = utils.merge(defaultOptions, options)

    this.container = document.querySelector(this.options.el)
    this.appendChild()
    this.containerAttr = this.getContainerAttr()
    this.currentIndex = 1;
    this.currentTransformX = 0;
    this.duration = .5;
    this.setStyle(this.currentIndex, '0')
    this.interval = null;

    this.enableTouch()
  }

  Slides.prototype.appendChild = function() {
    var firstEl = this.container.children[0];
    var lastEl = this.container.children[this.container.children.length - 1]
    this.container.insertBefore(lastEl.cloneNode(true), firstEl)
    this.container.appendChild(firstEl.cloneNode(true))
  }

  Slides.prototype.getContainerAttr = function() {
    var childrens = this.container.children;
    return {
      width: childrens[0].clientWidth,
      height: childrens[0].clientHeight,
      length: childrens.length
    };
  }

  Slides.prototype.setStyle = function(step, duration) {
    step = step || 0;
    duration = duration || 0.5;
    offset = step * this.containerAttr.width
    
    var styles = {
      width: this.containerAttr.width * this.containerAttr.length + 'px',
      height: this.containerAttr.height + 'px',
      transition: 'transform ease-in-out ' + duration +'s',
      transform: 'translate3d(-' + offset + 'px, 0, 0)'
    }

    this.currentTransformX = -offset;

    this.container.setAttribute('style', utils.obj2Style(styles));
  }

  Slides.prototype.next = function() {
    this.currentIndex ++;
    this.setStyle(this.currentIndex);
    if (this.currentIndex == this.containerAttr.length - 1) {
      setTimeout(() => {
        this.currentIndex = 1;
        this.setStyle(this.currentIndex, '0');
      }, this.duration * 1000);

    }
  }


  Slides.prototype.prev = function () {
    this.currentIndex--;
    this.setStyle(this.currentIndex);
    if (this.currentIndex == 0) {
      setTimeout(() => {
        this.currentIndex = this.containerAttr.length - 2;
        this.setStyle(this.currentIndex, '0');
      }, this.duration * 1000);

    }
  }

  Slides.prototype.auto = function (duration) {
    duration = duration || 3000
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.next()
    }, duration);
  }

  Slides.prototype.stop = function() {
    clearInterval(this.interval)
    this.interval = null;
  }

  Slides.prototype.enableTouch = function() {
    var _ = this;
    var startX = 0;
    var distance = 0;

    this.container.addEventListener('touchstart', function (e) {
      _.stop()
      startX = e.touches[0].clientX;
    })
    this.container.addEventListener('touchmove', function(e) {
      distance = e.touches[0].clientX - startX;
      _.container.style.transform = 'translate3d(' + (_.currentTransformX + distance) +'px, 0px, 0px)';
      _.container.style.transition = 'none';
    })

    this.container.addEventListener('touchend', function (e) {
      if (Math.abs(distance) < 10) {
        return;
      }
      if (distance < 0) {
        _.next();
      } else {
        _.prev();
      }
    })
  }

  return Slides;
})