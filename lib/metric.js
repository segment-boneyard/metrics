
var defaults = require('defaults');
var Dates = require('date-math');
var debug = require('debug')('metrics');
var max = require('lodash').max;
var range = require('lodash').range;
var isDate = require('lodash').isDate;
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var ms = require('ms');

/**
 * Expose `Metric`.
 */

module.exports = Metric;

/**
 * Initialize a `Metric` instance.
 */

function Metric () {
  if (!(this instanceof Metric)) return new Metric();
  this.values = {};
  this.window();
}

/**
 * Inherit from `Emitter`.
 */

inherit(Metric, Emitter);


/**
 * Set the time window for each time granularity.
 * 
 * @param  {Map} window A map of granularity to ms time window
 */
Metric.prototype.window = function (window) {
  this.windows = defaults(window || {}, {
    daily: ms('5 hours'),
    weekly: ms('1 day'),
    monthly: ms('3 days'),
    yearly: ms('5 days')
  });
  return this;
};

/**
 * Set a `value` at a `timestamp`.
 *
 * @param {object} value
 * @param {Date} timestamp
 */

Metric.prototype.set = function (value, timestamp) {
  if (!isDate(timestamp)) timestamp = new Date();
  if (!value) throw new Error('Value must be valid.');
  var t = timestamp.getTime();
  this.values[t] = value;
  debug('set %s: %s', value, timestamp);
  this.emit('set', value, timestamp);
  return this;
};

/**
 * Return the last recorded metric value.
 *
 * @param {String} key
 * @return {Object}
 */

Metric.prototype.latest = function () {
  var dates = Object.keys(this.values);
  var d = max(dates, function (d) { return parseInt(d); });
  return this.values[d];
};

/**
 * Get a list of metric value dates.
 *
 * @returns {Array|Date}
 */

Metric.prototype.dates = function () {
  return Object.keys(this.values).function (d) { 
    return new Date(parseInt(d)); 
  });
};

/**
 * Return the values at the daily granularity from `start` 
 * days ago to `end` days ago.
 *
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.daily = function (start, end) {
  return this.resolve(new Date(), Dates.day, this.windows.daily, start, end);
};

/**
 * Return the values at the weekly granularity from `start` 
 * weeks ago to `end` weeks ago.
 *
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.weekly = function (start, end) {
  return this.resolve(new Date(), Dates.week, this.windows.weekly, start, end);
};

/**
 * Return the values at the monthly granularity from `start` 
 * months ago to `end` months ago.
 *
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.monthly = function (start, end) {
  return this.resolve(new Date(), Dates.month, this.windows.monthly, start, end);
};

/**
 * Return the values at the yearly granularity from `start` 
 * years ago to `end` years ago.
 *
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.yearly = function (start, end) {
  return this.resolve(new Date(), Dates.year, this.windows.yearly, start, end);
};

/**
 * Return an array of dates from `start` to `end` differing by
 * `granularity` milliseconds. Start at the `relative` date.
 *
 * @param {Date} relative
 * @param {Dates} granularity
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.resolve = function (relative, granularity, window, start, end) {
  if (typeof start !== 'number') start = 0; // if no start, then today
  if (typeof end !== 'number') end = start; // if daily(-7), then range should be [-7, -7]
  if (end < 0 || start > end) throw new Error('Invalid range.')
  var self = this;
  // get all the dates available
  var dates = this.dates();
  // if start = -3 and end = 0, then range is [-3, -2, -1, 0]
  // if start = -2 and end = -1, then range is [-2, -1]
  var arr = range(start, end+1).map(function (delta) {
    // if granularity is day, then shift by the delta
    var d = granularity.shift(relative, delta);
    // find the minimum and maximim dates okay with this window
    var min = d.getTime() - window;
    var max = d.getTime() + window;
    // find all the dates that fall into that range
    var inRange = dates.filter(function (d) {
      var t = d.getTime();
      return t >= min && t <= max;
    });
    // find the largest timestamp satisfying
    var date = max(inRange, function (d) { return d.getTime() });
    // if we have a satisfying date, return the value associated
    if (!date) return null;
    else return self.values[date.getTime()];
  });
  if (arr.length === 1) return arr[0];
  else return arr;
};
