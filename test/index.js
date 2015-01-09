
var assert = require('assert');
var isDate = require('lodash').isDate;
var Metrics = require('..');
var datejs = require('date.js');
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
      metrics.on('a', function (metric) {
        assert(1, metric.latest());
        done();
      });
      metrics.set('a', 1);
    });

    it('should emit an event on key set with a timestamp', function (done) {
      var metrics = Metrics();
      var d = new Date('1/1/2014');
      metrics.on('a', function (metric) {
        assert(1, metric.latest());
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

      it('should allow 0', function () {
        assert.deepEqual(0, new Metric()
                    .set(0)
                    .latest());
      });

      it('should allow 0.0', function () {
        assert.deepEqual(0.0, new Metric()
                    .set(0.0)
                    .latest());
      });
    });

    describe('#timestamps', function () {
      it('should get a list of set timestamps', function () {
        assert(1, new Metric()
                    .set(2)
                    .timestamps().length);
      });
    });

    describe('#values', function () {
      it('should return a map of timestamps to values', function () {
        assert(1, Object.keys(new Metric()
                    .set(2)
                    .timestamps()).length);
      });
    });

    describe('#from', function () {
      it('should be able to the "X days ago" string', function () {
        assert(1, new Metric()
                    .set(1, datejs('7 days ago'))
                    .from('7 days ago'));
      });

      it('should be able to the "today" string', function () {
        assert(2, new Metric()
                    .set(2)
                    .from('today'));
      });

      it('should select the closest value inside the window', function () {
        var m = new Metric()
          .set(1, new Date('1/3/2015 14:00'))
          .set(2, new Date('1/3/2015 15:00'))
          .set(3, new Date('1/4/2015 2:00'));
        assert(2, m.from(new Date('1/3/2015 16:00')));
      });

      it('should not allow fetch outside window', function () {
        var window = ms('5 hours');
        var daysAgo = 30;
        var now = new Date();
        var outside = new Date(now.getTime() - ms(daysAgo + ' days') - window - 1);
        assert(null === new Metric()
          .set(1, outside)
          .from(daysAgo + ' days ago', window));
      });
    });
  });
});