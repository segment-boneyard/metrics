
var assert = require('assert');
var isDate = require('lodash').isDate;
var Metrics = require('..');
var Dates = require('date-math');
var Metric = Metrics.Metric;
var ms = require('ms');

describe('Metrics', function () {

  describe('#set', function () {
    it('should set a key', function () {
      assert(1, 
        Metrics()
        .set('a', 1)
        .get('a').latest());
    });
  });

  describe('#get', function () {
    assert(2, 
      Metrics()
        .set('b', 2)
        .get('b').latest());
  });

  describe('#on', function () {

    it('should emit an event on key set', function (done) {
      var metrics = Metrics();
      metrics.on('a', function (metric, value, timestamp) {
        assert(1, metric.latest());
        assert(1, value);
        assert(isDate(timestamp));
        done();
      });
      metrics.set('a', 1);
    });

    it('should emit an event on key set with a timestamp', function (done) {
      var metrics = Metrics();
      var d = new Date('1/1/2014');
      metrics.on('a', function (m, value, timestamp) {
        assert(1, value);
        assert(d, timestamp);
        done();
      });
      metrics.set('a', 1, d);
    });

    it('should allow you to listen for multiple keys', function (done) {
      var t = 0;
      var metrics = Metrics();
      metrics.on('a', 'b', function (a, b) {
        assert(1, a.latest());
        assert(2, b.latest());
        assert(2, t);
        done();
      });
      metrics.set('a', 1); t = 1;
      setTimeout(function () {
        t = 2; metrics.set('b', 2);
      }, 100);
    });
  });

  describe('#every', function () {
    it('should execute once', function (done) {
      var metrics = Metrics();
      metrics.every(100, function (metrics) {
        metrics.set('a', 1);
        metrics.stop();
        done();
      });
    });
  });

  describe('Metric', function () {

    describe('#set', function () {
      it('should set the latest value by default', function () {
        assert(1, new Metric()
                    .set(1)
                    .latest());
      });

      it('should set a value by timestamp', function () {
        assert(2, new Metric()
                    .set(2, new Date('3/1/2013'))
                    .set(1, new Date('2/1/2013'))
                    .latest());
      });
    });

    // TODO: write for loop to create tests for weekly, monthly, yearly
    describe('daily', function () {
      it('should get the todays value by default', function () {
        assert(1, new Metric()
                    .set(1)
                    .daily());
      });

      it('should be able to get a single past value', function () {
        var today = new Date();
        var sevenDaysAgo = Dates.day.shift(today, -7);
        assert(1, new Metric()
                    .set(1, sevenDaysAgo)
                    .set(2, today)
                    .daily(-7));
      });

      it('should be able to get a range', function () {
        var result = new Metric()
                    .set(1, sevenDaysAgo)
                    .set(2, today)
                    .daily(-7, 0);
        var expected = [1, null, null, null, null, null, null, 2);
        assert(expected, result);
      });

      it('should not allow fetch outside window', function () {
        var window = ms('5 hours');
        var daysAgo = -30;
        var now = new Date();
        var outside = new Date(now.getTime() - window - 1);
        assert(null, new Metric()
          .window({ daily: window })
          .set(1, outside)
          .daily(daysAgo));
      });
    });
  });
});