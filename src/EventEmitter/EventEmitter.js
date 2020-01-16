(function(root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global = root || self;
    global.EventEmitter = factory()
  }
})(this, function() {

  function isValidListener(listener) {
    if (typeof listener === 'function') {
      return true;
    } else if (typeof listener === 'object') {
      return isValidListener(listener.listener);
    } else {
      return false;
    }
  }

  function indexOf(array, item) {
    var index = -1;
    item = typeof item === 'object' ? item.listener : item;

    for (var i = 0; i < array.length; i ++) {
      if (array[i].listener === item) {
        index = i;
        break;
      }
    }

    return index;
  }

  function EventEmitter() {
    this._events = {}
  }

  EventEmitter.prototype.on = function(eventName, listener) {
    if (!eventName || !listener) return;
    if (!isValidListener) {
      throw new TypeError('listener must be a function');
    }

    var events = this._events;

    var listeners = events[eventName] = events[eventName] || [];
    var listenerIsWrapped = typeof listener === 'object';

    if (indexOf(listeners, listener) === -1) {
      listeners.push(listenerIsWrapped ? listener: {
        listener: listener,
        once: false
      })
    }

    return this;
  }

  EventEmitter.prototype.once = function(eventName, listener) {
    return this.on(eventName, {
      listener: listener,
      once: true
    });
  }

  EventEmitter.prototype.off = function(eventName, listener) {
    var listeners = this._events[eventName];
    if (!listeners) return;
    var index = indexOf(listeners, listener);
    if (index !== -1) {
      listeners.splice(index, 1, null);
    }

    return this;
  }

  
  EventEmitter.prototype.emit = function(eventName, args) {
    var listeners = this._events[eventName];
    if (!listeners) return;
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      console.log(listeners)
      if (listener) {
        listener.listener.apply(this, args || []);
        if (listener.once) {
          this.off(eventName, listener)
        }
      }
    }

    return this;
  }

  
  EventEmitter.prototype.offAll = function (eventName) {
    if (!eventName) return;
    // this._events[eventName] = [];
    delete this._events[eventName];
  }

  return EventEmitter;
})