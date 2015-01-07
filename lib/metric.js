
var defaults = require('defaults');
var Dates = require('date-math');
var debug = require('debug')('metrics');
var max = require('lodash').max;
var isNull = require('lodash').isNull;
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
  this._values = {};
  this.window();
}

/**
 * Inherit from `Emitter`.
 */

inherit(Metric, Emitter);

/**
 * Set the time `window` for each time granularity.
 * 
 * @param {Obhect} window An object mapping time granularity 
 *                        to millisecond time window
 */

Metric.prototype.window = function (window) {
  this._window = defaults(window || {}, {
    days: ms('5 hours'),
    weeks: ms('1 day'),
    months: ms('3 days'),
    years: ms('5 days')
  });
  return this;
};

/**
 * Set a `value` at a `timestamp`.
 *
 * @param {object} value
 * @param {Date} timestamp
 * @param {Object} options
 */

Metric.prototype.set = function (value, timestamp, options) {
  if (!isDate(timestamp)) timestamp = new Date();
  if (isNull(value)) throw new Error('Value must be valid.');
  var t = timestamp.getTime();
  this._values[t] = value;
  debug('set %s: %s', value, timestamp);
  this.emit('set', value, timestamp, options);
  return this;
};

/**
 * Return the last recorded metric value.
 *
 * @param {String} key
 * @return {Object}
 */

Metric.prototype.latest = function () {
  var dates = Object.keys(this._values);
  var d = max(dates, function (d) { return parseInt(d); });
  return this._values[d];
};

/**
 * Get a list of metric value dates.
 *
 * @returns {Array|Date}
 */

Metric.prototype.dates = function () {
  return Object.keys(this._values).map(function (d) { 
    return new Date(parseInt(d)); 
  });
};

/**
 * Return the value from `days` ago.
 *
 * @param {Integer} days
 * @return {Array|Object}
 */

Metric.prototype.daysAgo = function (days) {
  return this.ago(new Date(), Dates.day, days, this._window.days);
};

/**
 *  Return the value from `weeks` ago.
 *
 * @param {Integer} weeks
 * @return {Array|Object}
 */

Metric.prototype.weeksAgo = function (weeks) {
  return this.ago(new Date(), Dates.week, weeks, this._window.weeks);
};

/**
 * Return the value from `months` ago.
 *
 * @param {Integer} start
 * @param {Integer} end
 * @return {Array|Object}
 */

Metric.prototype.monthsAgo = function (months) {
  return this.ago(new Date(), Dates.month, months, this._window.months);
};

/**
 * Return the value from `years` ago.
 *
 * @param {Integer} years
 * @return {Array|Object}
 */

Metric.prototype.yearsAgo = function (years) {
  return this.ago(new Date(), Dates.year, years, this._window.years);
};

/**
 * Return the value from `ago` `granularity` from the `relative` time 
 * window.
 *
 * @param {Date} relative
 * @param {Dates} granularity
 * @param {Integer} ago
 * @return {Array|Object}
 */

Metric.prototype.ago = function (relative, granularity, ago, window) {
  if (typeof ago !== 'number') throw new Error('Ago must be a number.');
  if (typeof ago < 0) throw new Error('Ago must be less than 0.');
  var self = this;
  // get all the dates available
  var dates = this.dates();
  // go back in time as much as requested
  var date = granularity.shift(relative, -ago);
  // find the minimum and maximim dates okay with this window
  var minWindow = date.getTime() - window;
  var maxWindow = date.getTime() + window;
  // find all the dates that fall into that range
  var inRange = dates.filter(function (d) {
    var t = d.getTime();
    return t >= minWindow && t <= maxWindow;
  });
  if (inRange.length === 0) return null;
  return self._values[inRange[0].getTime()];
};
