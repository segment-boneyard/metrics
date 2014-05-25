
var assert = require('assert');
var Metrics = require('..');

describe('metrics', function () {

  describe('#set', function () {
    it('should set a key', function () {
      assert(1, Metrics().set('a', 1).get('a'));
    });
  });

  describe('#get', function () {
    assert(2, Metrics().set('b', 2).get('b'));
  });

  describe('#on', function () {

    it('should emit an event on key set', function (done) {
      var metrics = Metrics();
      metrics.on('a', function (val) {
        assert(1, val);
        done();
      });
      metrics.set('a', 1);
    });

    it('should allow you to listen for multiple keys', function (done) {
      var t = 0;
      var metrics = Metrics();
      metrics.on('a', 'b', function (a, b) {
        assert(1, a);
        assert(2, b);
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
});