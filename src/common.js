
/** String Supplant from Douglas Crockford's Remedial JavaScript */
if (!String.prototype.supplant) {
 String.prototype.supplant = function (o) {
   return this.replace(/\{([^{}]*)\}/g, function (a, b) {
     var r = o[b];
     return typeof r === 'string' || typeof r === 'number' ? r : a;
   });
 };
}

/** Array Remove - By John Resig (MIT Licensed) */
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


/** A Simple Observer Pattern Implementation */

var observable = function (observers) {

  // private observer list
  observers = observers || {};

  this.on = function (event, callback) {
    observers[event] = observers[event] || [];

    if ($.isFunction(callback)) {
      observers[event].push(callback);
    }

    return this;
  };

  // registers a one-time event handler
  this.once = function (event, callback) {
    var self = this;

    return this.on(event, function () {
      self.off(event, callback);
      callback.apply(self, arguments);
    });
  };

  this.off = function (event, callback) {
    if (observers[event]) {
      var i, os = observers[event], matches = [];

      if (callback) {
        for (i = 0; i < os.length; ++i) {
          if (os[i] === callback) {
            matches.push(i);
          }
        }

        for (i = 0; i < matches; ++i) {
          os.remove(i);
        }

      }
      else {
        // remove all observers for the event
        observers[event] = [];
      }
    }

    return this;
  };

  this.notify = function () {
    var self = this, args = Array.prototype.slice.apply(arguments), event = arguments[0];

    if (observers[event]) {
      $.each(observers[event], function () {
        if ($.isFunction(this)) {
          this.apply(self, args);
        }
      });
    }

    return this;
  };

  return this;
};

if (exports) {
  exports.observable = observable;
}