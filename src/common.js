
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


var observable = function () {
	
	this.on = function (event, callback) {
		this.observers = this.observers || {};
		this.observers[event] = this.observers[event] || [];
	
		if ($.isFunction(callback)) {
			this.observers[event].push(callback);			
		}
	
		return this;
	};
	
	this.off = function (event, callback) {
		if (this.observers && this.observers[event]) {
			var i, observers = this.observers[event], matches = [];
		
			if (callback) {
				for (i = 0; i < observers.length; ++i) {
					if (observers[i] === callback) {
						matches.push(i);
					}
				}
			
				for (i = 0; i < matches; ++i) {
					observers.remove(i);
				}
			
			}
			else {
				// remove all observers for the event
				this.observers[event] = [];
			}			
		}
	
		return this;
	};
	
	this.notify = function (event) {
		if (this.observers && this.observers[event]) {
			$.each(this.observers[event], function () {
				if ($.isFunction(this)) {
					this.call(event);
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