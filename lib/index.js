
var assert = require('assert');
var debug = require('debug')('metrics');
var isDate = require('lodash').isDate;
var debounce = require('lodash').debounce;
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var ms = require('ms');
var Metric = require('./metric');

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
 * Expose `Metric`.
 */

Metrics.Metric = Metric;

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
 * Set a metric `value` at `key`.
 *
 * @param {String} key
 * @param {Object} value
 * @param {Date} timestamp
 * @param {Object} options
 */

Metrics.prototype.set = function (key, value, timestamp, options) {
  if (!isDate(timestamp)) timestamp = new Date();
  var m = this.metrics[key];
  if (!m) { 
    m = new Metric(); 
    this.metrics[key] = m; 
  }
  m.set(value, timestamp, options);
  debug('set %s: %s: %s', key, value, timestamp);
  this.emit(key, m, value, timestamp, options);
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
  cb = debounce(cb, 25); // if there's too many events, debounce by 100 ms
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