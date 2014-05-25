
# metrics

  Simple and _pluggable_ business metrics.

```js
var Metrics = require('metrics');

Metrics()
  .every('5m', charges('stripe-key'))
  .every('10m', subscriptions('stripe-key'))
  .every('1h', helpscout('helpscout-key'))

  .use(function (metrics) {
    metrics.on('stripe charges last month', function (val) {
      geckoboard('widget-id').number(val));
    });
  });
```

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)


  **It's easy to get started:** there's already plugins for [Stripe][1], [Helpscout][2], [AWS][3], and others.

  **It separates data and views:** split the raw data from how its presented.

  **It's dashboard agnostic:** so you can use [Geckoboard][4], [Ducksboard][5], [Leftronic][6], or your own internal dashboard.

  **It pushes you in the right direction:** use [Segment][7]'s [metrics expertise][8] to avoid the wrong metrics.

[1]: https://github.com/metrics-stripe-charges
[2]: https://github.com/segmentio/metrics-helpscout
[3]: https://github.com/segmentio/metrics-aws-billing
[4]: http://www.geckoboard.com/
[5]: https://ducksboard.com/
[6]: https://www.leftronic.com/
[7]: https://segment.io/
[8]: https://segment.io/academy/dashboard-metrics-that-actually-work/

## Installation

    $ npm install segmentio/metrics


## How does it work?

**Metrics** is super simple. You write a plugin that puts data in, and you write plugins that use that data. [Segment](https://segment.io) uses it for sending internal metrics to a dashboard. 

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
  metrics.on('total charges', geckoboard('widget-id').number);
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
- [metrics-stripe-charges](https://github.com/metrics-stripe-charges) - how much money you're making every month (and today!)
- [metrics-stripe-subscriptions](https://github.com/metrics-stripe-charges) - how much subscriptions you have, and how much recurring revenue you're generating

![](https://f.cloud.github.com/assets/658544/2361183/33c4df78-a62e-11e3-9921-6591e787e43e.png)

## API

At its core, **metrics** is a simple key value store. Plugins put data into a hashtable, and then use that data to update dashboards, send emails, and really anything you want.

#### new Metrics()

Create a new `Metrics` instance.

#### #set(key, val)

Set a `key` / `val` pair.

#### #get(key)

Get a value at `key`.

#### #keys()

Get a list of keys.

#### #every(interval, plugin)

Add a metrics plugin to run on an `interval`.

```js
var metrics = new Metrics()
  .every('5m', function (metrics) {
    metrics.set('hours', new Date().getHours());
    metrics.set('minutes', new Date().getMinutes());
  });
```

#### #on(keys.., cb)

Listen for when one or more keys become available.

```js
var metrics = new Metrics()
  .every('5m', function (metrics) {
    metrics.set('hours', new Date().getHours());
    metrics.set('minutes', new Date().getMinutes());
  });

metrics.on('hours', 'minutes', function (h, m) {
  console.log('time update: ' + h + ':' + m);
});
```

#### #use(plugin)

Add a plugin that consumes metrics data.

```js
new Metrics()
  .every('5m', function (metrics) {
    metrics.set('hours', new Date().getHours());
    metrics.set('minutes', new Date().getMinutes());
  })
  .use(function (metrics) {
    metrics.on('hours', 'minutes', function (h, m) {
      console.log('time update: ' + h + ':' + m);
    });
  });

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