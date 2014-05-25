
var assert = require('assert');
var debug = require('debug')('metrics');
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var ms = require('ms');

/**
 * Expose `Metrics`.
 */

module.exports = Metrics;

/**
 * Initialize a `Metrics` instance.
 */

function Metrics () {
  if (!(this instanceof Metrics)) return new Metrics();
  this.metrics = {};
  this.intervals = [];
}

/**
 * Inherit from `Emitter`.
 */

inherit(Metrics, Emitter);

/**
 * Adds a metrics middleware `fn`.
 *
 * @pram {Object} fn
 * @return {Metrics}
 */

Metrics.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Return a metric saved as `key`.
 *
 * @param {String} key
 * @return {Object}
 */

Metrics.prototype.get = function (key) {
  return this.metrics[key];
};

/**
 * Set a metric `val` at `key`.
 *
 * @param {String} key
 * @param {String} val
 */

Metrics.prototype.set = function (key, val) {
  this.metrics[key] = val;
  debug('set %s: %s', key, val);
  this.emit(key, val);
  return this;
};


/**
 * Get a list of metric keys.
 *
 * @returns {Array|String}
 */

Metrics.prototype.keys = function () {
  return Object.keys(this.metrics);
};


/**
 * Set an interval to refresh the `fn` with.
 *
 * @param {String} interval
 * @param {Function} fn
 */

Metrics.prototype.every = function (interval, fn) {
  if (typeof interval !== 'number') interval = ms(interval);
  assert('number' == typeof interval, 'Needs a valid time interval.');
  var self = this;
  this.intervals.push(setInterval(function () {
    fn(self);
  }, interval));
  fn(this); // run now
  return this;
};

/**
 * Stop all the metrics intervals.
 */

Metrics.prototype.stop = function () {
  this.intervals.forEach(clearInterval);
};


/**
 * Register a `callback` for when a group of metric `keys` are present.
 *
 * @params {String..} keys
 * @params {Function} callback
 */

Metrics.prototype.on = function () {
  var cb = arguments[arguments.length - 1];
  assert(typeof cb === 'function', 'Last argument must be a callback');
  var keys = [].slice.call(arguments, 0, arguments.length - 1);
  var self = this;
  keys.forEach(function (key) {
    Emitter.prototype.on.call(self, key, function () {
      var exists = keys.reduce(function (memo, k) {
        return memo && self.get(k) != null;
      }, true);
      var vals = keys.map(function (k) { return self.get(k); });
      if (exists) cb.apply(null, vals);
    });
  });
};