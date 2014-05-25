
# dashboards

  Simple and _pluggable_ dashboards.

```js
var Dashboards = require('dashboards');

var dashboards = new Dashboards()
  .use(subscriptions('stripe-key'))
  .use(charges('stripe-key'))
  .use(support('helpscout-key'))
  .use(pipe('active tickets', geckoboard('widget-id').number)
  .run();
```

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)


  **It's easy to get started:** there's already plugins for [Stripe][1], [Helpscout][2], [AWS][3], and others.

  **It separates data and views:** make your own decisions about what to put on your dashboards.

  **It's dashboard agnostic:** so you can use [Geckoboard][4], [Ducksboard][5], [Leftronic][6], or your own internal dashboards.

  **It pushes you in the right direction:** use [Segment.io][7]'s [dashboards expertise][8] to avoid the wrong metrics.

[1]: https://github.com/dashboards-stripe-charges
[2]: https://github.com/segmentio/dashboards-helpscout
[3]: https://github.com/segmentio/dashboards-aws-billing
[4]: http://www.geckoboard.com/
[5]: https://ducksboard.com/
[6]: https://www.leftronic.com/
[7]: https://segment.io/
[8]: https://segment.io/academy/dashboard-metrics-that-actually-work/

## Installation

    $ npm install dashboards


## How does it work?

**Dashboards** is super simple. You write a plugin that puts data in, and you write plugins that send data to a dashboard. Plugins that need data defer execution until that data is available.

A plugin can learn about how much you're making on Stripe, and make that data available:

```js
var Stripe = require('stripe');

function charges (key) {
  var stripe = Stripe(key);
  return function (data, callback) {
    stripe.charges.list(function (err, charges)) {
        data['charges'] = charges.reduce(function (memo, charge) {
          return memo + (charge.amount / 100);
        }, 0);
        callback();
    });
  };
}
```

and another plugin can push the charge data to a geckoboard:

```js
var geckoboard = require('geckobard')('api-key');

function ready (data) {
  return data.charges != null;
}

function send (data, callback) {
  geckoboard('widget-id').number(data.charges, callback);
}
```

and now you have your first dashboard:

```js
var dashboards = new Dashboards()
  .use(charges('stripe-key'))
  .when(ready, send)
  .run();
```

but wait! waiting for data and piping it to a dashboard gets even easier: 

```js
var dashboards = new Dashboards()
  .use(charges('stripe-key'))
  .use(pipe('charges', geckoboard('widget-id').number)
  .run();
```

## Plugins

Existing plugins for dashboards can tell you:

- [dashboards-aws-billing](https://github.com/segmentio/dashboards-aws-billing) - how much your AWS hosting costs
- [dashboards-helpscout](https://github.com/segmentio/dashboards-helpscout) - how many active [Helpscout](http://helpscout.com) support tickets you have, and who they are assigned to
- [dashboards-stripe-charges](https://github.com/dashboards-stripe-charges) - how much money you're making every month (and today!)
- [dashboards-stripe-subscriptions](https://github.com/dashboards-stripe-charges) - how much subscriptions you have, and how much recurring revenue you're generating

![](https://f.cloud.github.com/assets/658544/2361183/33c4df78-a62e-11e3-9921-6591e787e43e.png)

## API

#### new Dashboards()

Create a new `Dashboards` instance.

#### #use(plugin)

Add a dashboard `plugin` which is either a function or an object that contains a `fn` plugin and a `ready` function, like so:

```js
{ ready: hasCharges, fn: send }
```

#### #when(ready, fn)

Execute the dashboard plugin `fn` when the `ready` function returns true. This allows you to wait until you have a piece of data before sending it to a dashboard. Read more about ready functions in [parallel-ware](https://github.com/segmentio/parallel-ware).

#### #run(callback)

  Run the dashboard plugins.


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