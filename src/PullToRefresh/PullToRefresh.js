(function(root, factory){
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
  : typeof define === 'function' && define.amd ? define(factory) :
      (global = root || self, global.PullToRefresh = factory());
})(this, function() {
  var utils = {
    isObject: function (obj) {
      return typeof obj === 'object' && obj !== null;
    },
    deepClone: function (source) {
      if (!this.isObject(source)) {
        return source;
      }
      var obj = {};
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          obj[key] = this.deepClone(source[key]);
        }
      }

      return obj;
    },
    merge: function (source, target) {
      var obj = this.deepClone(source);
      for (var key in target) {
        if (target.hasOwnProperty(key)) {
          obj[key] = this.deepClone(target[key])
        }
      }

      return obj;
    },
    obj2Style: function (obj) {
      var style = '';
      for (var key in obj) {
        style = style + key + ':' + obj[key] + ';'
      }

      return style;
    }
  }

  var statusEnum = {
    pending: 'pending',
    pulling: 'pulling',
    releasing: 'releasing',
    refreshing: 'refreshing'
  }

  function PullToRefresh(options) {
    this.options = options;
    this.startX = 0;
    this.endX = 0;
    this.distance = 0;
    this.status = statusEnum.pending //pending/pulling/releasing/refreshing
    this.init();
  }

  PullToRefresh.prototype.init = function() {
    this.$el = document.querySelector(this.options.el);
    this.createRefreshElement();
    this.setStyle(0);
    this.bindEvent();
  };

  PullToRefresh.prototype.createRefreshElement = function() {
    var wrapper = document.createElement('div');
    wrapper.className = 'refresh-wrapper';
    if (this.options.el !== 'body') {
      this.$el.parentNode.insertBefore(wrapper, this.$el)
    } else {
      document.body.insertBefore(wrapper, document.body.firstChild)
    }

    var container = document.createElement('div');
    container.className = 'container';
    var icon = document.createElement('div');
    icon.className = 'icon';
    var text = document.createElement('div');
    text.className = 'text';

    container.appendChild(icon)
    container.appendChild(text)

    wrapper.appendChild(container)
    this.$wrapper = wrapper;
    this.$container = container;
    this.$icon = icon;
    this.$text = text;
  };

  PullToRefresh.prototype.setStyle = function(height, duration) {
    height = height || '0'
    duration = duration || '0'
    var wrapperStyle = {
      'pointer-events': 'none',
      'top': 0,
      'height': 0,
      'min-height': height + 'px',
      'transition': 'height ' + duration + 's, min-height ' + duration + 's',
      'text-align': 'center',
      'background': '#1abc9c',
      'color': '#FFF',
      'overflow': 'hidden'
    };

    var containerStyle = {
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'height': this.options.distance + 'px'
    }
    this.$wrapper.setAttribute('style', utils.obj2Style(wrapperStyle))
    this.$container.setAttribute('style', utils.obj2Style(containerStyle))
  }

  PullToRefresh.prototype.updataEl = function() {
    this.$text.textContent = this.options.text[this.status] || '';
  }

  PullToRefresh.prototype.bindEvent = function() {
    window.addEventListener('touchstart', this.onTouchStart.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), {passive: false});
    window.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  PullToRefresh.prototype.onTouchStart = function(e) {
    if (this.status !== statusEnum.pending) {
      return;
    }
    this.startX = e.touches[0].screenX;
    this.status = statusEnum.pulling;
    this.updataEl();
  }

  PullToRefresh.prototype.onTouchMove = function (e) {
    e.preventDefault();
    if (this.status !== statusEnum.pending && this.status !== statusEnum.pulling) {
      return;
    }

    
    this.endX = e.touches[0].screenX;
    this.distance = this.startX - this.endX;

    if (this.distance < this.options.distance) {
      this.status = statusEnum.pulling;
    } else {
      this.status = statusEnum.releasing;
    }

    this.setStyle(this.distance);
    this.updataEl();
  }

  PullToRefresh.prototype.onTouchEnd = function (e) {
    if (this.distance < this.options.distance) {
      this.setStyle(0, '.3');
    } else {
      this.setStyle(this.options.distance, '.3');
      this.status = statusEnum.refreshing;
    }
    this.updataEl();

    this.options.onRefresh(this.onReset.bind(this));
  }

  PullToRefresh.prototype.onReset = function() {
    this.status = statusEnum.pending;
    this.setStyle(0, '.3');
  }

  return PullToRefresh;
});