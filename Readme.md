
[![Build Status](https://circleci.com/gh/segmentio/metrics.png?circle-token=bf2af92121185d80a46f1a1f605a90ee1a6b4be1)](https://circleci.com/gh/segmentio/metrics)

# metrics

  Simple and _pluggable_ business **metrics**. It makes internal reporting _much_ easier.

  [Segment](https://segment.com) uses **metrics** as an internal API to power our dashboards, auto-updating spreadsheets, and other admin services. 

```js
var Metrics = require('metrics');

Metrics()
  .every('5m', charges('stripe-key'))
  .every('10m', subscriptions('stripe-key'))
  .every('1h', helpscout('helpscout-key'))

  .use(function (metrics) {
    metrics.on('stripe charges last 30 days', function (metric) {
      geckoboard('widget-id').number(metric.latest()));
    });
  });
```

Plugins add their own metrics using keys like `stripe charges last 30 days`. Each company can customize their reporting by writing their own [plugins](#plugins). 

The code above calculates revenue and support metrics that can then be visualized with a dashboard, like [Geckoboard](https://geckoboard.com):

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e11e3-8f49-e327e89595cd.png)


  **It's easy to get started:** there's already plugins for [Stripe][1], [Helpscout][2], [AWS][3], and others.

  **It separates data and views:** split the raw data from how its presented.

  **It's dashboard agnostic:** so you can use [Geckoboard][4], [Ducksboard][5], [Leftronic][6], or your own internal dashboard.

  **It pushes you in the right direction:** use [Segment][7]'s [metrics expertise][8] to avoid the wrong metrics.

  **Its an internal metrics API:** [Segment](https://segment.com) uses the [metrics-express](https://github.com/segmentio/metrics-express) plugin to serve our metrics to other internal services (like admin tools and auto-updating spreadsheets).

[1]: https://github.com/segmentio/metrics-stripe-charges
[2]: https://github.com/segmentio/metrics-helpscout
[3]: https://github.com/segmentio/metrics-aws-billing
[4]: http://www.geckoboard.com/
[5]: https://ducksboard.com/
[6]: https://www.leftronic.com/
[7]: https://segment.com/
[8]: https://segment.com/academy/dashboard-metrics-that-actually-work/

## Installation

    $ npm install segmentio/metrics


## How does it work?

**Metrics** is super simple. Plugins write data into a key value store, and other plugins then send that data to dashboards or other reporting tools.

A plugin can learn about how much you're making on Stripe, and make that data available:

```js
var stripe = require('stripe')(key);

module.exports = function (metrics) {
  stripe.charges.list(function (err, charges) {
    metrics.set('total charges', charges.length);
  });
};
```

and another plugin can push the data to a geckoboard:

```js
var geckoboard = require('geckobard')('api-key');

module.exports = function (metrics) {
  metrics.on('total charges', function (metric) {
    geckoboard('widget-id').number(metric.latest());
  });
}
```

and now you have your first dashboard.

```js
Metrics()
  .every('5m', charges)
  .use(dashboard);
```

## Plugins

 Existing plugins for metrics can tell you:

- [metrics-aws-billing](https://github.com/segmentio/metrics-aws-billing) - how much your AWS hosting costs
- [metrics-helpscout](https://github.com/segmentio/metrics-helpscout) - how many active [Helpscout](http://helpscout.com) support tickets you have, and who they're assigned to
- [metrics-stripe-charges](https://github.com/segmentio/metrics-stripe-charges) - how much money you're making every month (and today!)
- [metrics-stripe-subscriptions](https://github.com/segmentio/metrics-stripe-charges) - how much subscriptions you have, and how much recurring revenue you're generating
- [metrics-express](https://github.com/segmentio/metrics-express) - serves your metrics as an HTTP API using an express subapp

![](https://f.cloud.github.com/assets/658544/2361183/33c4df78-a62e11e3-9921-6591e787e43e.png)

It's normal for every company to care about different metrics. If your plugin can help others do easier reporting, pull request this [Readme.md](https://github.com/segmentio/metrics/blob/master/Readme.md) to add your own plugin to this list.


## API

At its core, **metrics** is a simple key value store. Plugins put data into a hashtable, and other plugins then use that data to update dashboards, send emails, or really anything you want.

#### new Metrics()

Create a new `Metrics` instance.

#### .set(key, value, timestamp)

Set a `key` / `value` pair at a `timestamp` for a [Metric](#new-metric). If no `timestamp` is provided, current time is assumed.

#### .get(key)

Get a [Metric](#new-metric) at `key`.

#### .keys()

Get a list of keys.

#### .every(interval, plugin)

Add a metrics plugin to run on an `interval`.

```js
var metrics = new Metrics()
  .every('5m', function (metrics) {
    metrics.set('mrr', 1000);
    metrics.set('arr', 1000*12);
  });
```

#### .on(keys.., cb)

Listen for when one or more keys become available.

```js
var metrics = new Metrics()
  .every('5m', function (metrics) {
    metrics.set('mrr', 1000);
    metrics.set('arr', 1000*12);
  });

metrics.on('mrr', 'arr', function (mrr, arr) {
  console.log('mrr update: ' + mrr.latest() + ', arr: ' + arr.latest());
});
```

#### .use(plugin)

Add a plugin that consumes metrics data.

```js
new Metrics()
  .every('5m', function (metrics) {
    metrics.set('mrr', 1000);
    metrics.set('arr', 1000*12);
  })
  .use(function (metrics) {
    metrics.on('mrr', 'arr', function (mrr, arr) {
      console.log('mrr update: ' + mrr.latest() + ', arr: ' + arr.latest());
    });
  });

```

#### new Metric()

A `Metric` instance wraps a single metric `key`.

```js
var m = new Metric()
  .set(42, new Date(1388563200000))
  .set(57, new Date(1389168000000));

m.latest()
// 57
```

#### .set(value[, timestamp])

Set a metric `value` at a `timestamp`. If there's no `timestamp` provided, the current time will be used.

```js
var m = new Metric().set(68);
m.latest();
// 68
```

#### .latest()

Get the latest recorded metric value.

#### .daysAgo(days)

Return the value from `days` ago.

```js
var Dates = require('date-math');

var m = new Metric();

var today = new Date();
var yesterday = Dates.day.shift(today, 1);

m.set(5, yesterday);
m.set(10, today);

m.daysAgo(1); // get the latest value
// 5
```

#### .weeksAgo(weeks)

Return the value from `weeks` ago.

#### .months(months)

Return the value from `months` ago.

#### .yearsAgo(years)

Return the value from `years` ago.

## Window

The metrics service doesn't fetch metrics at perfect time granularities. That means today's most recent value may be a few hours ago, and yesterday's may have been collected 18 hours ago. A `Metric` will return the metric data along a granularity only if it falls into the proper window. 

```js
var now = new Date('Wed Nov 26 2014 16:00:00 GMT-0800 (PST)'
var minus26Hours = new Date('Wed Nov 25 2014 14:00:00 GMT-0800 (PST)'

var m = new Metric();
m.set(5, minus26Hours); // happened 26 hours ago
m.set(10, now); // happened now

m.daysAgo(1); // get yesterday's metrics
// 5
```

In the above example, a metric's value will be returned if it falls within the following threshold window: 

```js
var ms = require('ms');

var m = new Metric();
m.window({
  days: ms('5 hours'),
  weeks: ms('1 day'),
  months: ms('3 days'),
  years: ms('5 days')
});

m.set(5, minus26Hours); // happened 26 hours ago
m.set(10, now); // happened now

m.daysAgo(1); // get yesterday's data
// 5

// now let's set a smaller daily window
m.window({ days: ms('1 hour')});

m.daysAgo(1); // yesterday's data no longer falls into the window
// null
```

## License

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```
