
var defaults = require('defaults');
var debug = require('debug')('metrics');
var max = require('lodash').max;
var isNull = require('lodash').isNull;
var range = require('lodash').range;
var isDate = require('lodash').isDate;
var isNumber = require('lodash').isNumber;
var sort = require('lodash').sortBy;
var datejs = require('date.js');
var cloneDeep = require('lodash').cloneDeep;
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
}

/**
 * Inherit from `Emitter`.
 */

inherit(Metric, Emitter);

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
  this.emit('set', value, timestamp, options);
  return this;
};

/**
 * Return an array of dates representing the timestamps
 * at which this metric has keys recorded.
 * 
 * @return {Array|Date} timestamps
 */

Metric.prototype.timestamps = function () {
  return Object.keys(this._values).map(function (timestamp) {
    return new Date(parseInt(timestamp));
  });
};

/**
 * Return a map of the timestamps to values 
 * that are recorded for this metric.
 * 
 * @return {Object}
 */

Metric.prototype.values = function () {
  return cloneDeep(this._values);
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
 * Return the value from `date`, accepting any 
 * valid [date.js](https://github.com/MatthewMueller/date#examples) input.
 *
 * @param {String|Date} date
 * @param {Number} window
 * @return {Object}
 */

Metric.prototype.from = function (date, window) {
  if (!isDate(date)) date = datejs(date);
  if (!isDate(date)) return new Error('Failed to parse ' + date + ' into a date.');
  if (!isNumber(window)) {
    var delta = Date.now() - date.getTime();
    if (delta >= ms('1 year')) window = ms ('1 week');
    else if (delta >= ms('1 month')) window = ms('3 days');
    else if (delta >= ms('1 week')) window = ms('1 day');
    else if (delta >= ms('1 day')) window = ms('5 hours');
    else delta = ms ('1 hour');
  }

  // sort the dates
  var dates = sort(this.timestamps().map(function (timestamp) {
    // calculate the distance
    return Math.abs(date.getTime() - timestamp.getTime()); 
  }));

  if (dates.length > 0 && // if we we have metric values available
      Math.abs(dates[0] - date.getTime()) <= window) { // and they are close enough to desired window
    return this._values[dates[0]];
  } else {
    return null;
  }
};