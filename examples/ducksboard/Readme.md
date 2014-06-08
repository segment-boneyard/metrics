
# Metrics: Stripe + Ducksboard

![Stripe](http://ignitiondeck.com/id/wp-content/uploads/2013/06/stripe-logo.png)

[Ducksboard](https://segmentio.github.io/metrics/build/lib/company-logos/images/ducksboard.png)

This [metrics](https://github.com/segmentio/metrics) example is all you need to send your previous month of [Stripe](https://stripe.com) charges to a [Ducksboard](https://ducksboard.com) dashboard.

```js
var Metrics = require('metrics');
var charges = require('metrics-stripe-charges');
var ducksnode = require('ducksnode').create;
var ducksboard = ducksnode({ api_key: 'DUCKSBOARD_API_KEY' });

Metrics()
  .every('10m', charges('STRIPE_API_KEY'))
  .use(dashboard);

function dashboard (metrics) {
  metrics.on('stripe charges last month', function (charges) {
    ducksboard.push(DUCKSBOARD_WIDGET_ID, charges);
  });
}
```

After you enter your Ducksboard and Stripe API keys, you can run the example with:

```bash
DEBUG=* node index.js
```

And you'll see your Ducksboard dashboard update with new Stripe charge numbers every 10 minutes.

![](https://cloud.githubusercontent.com/assets/658544/3212467/c4e30f06-ef5e-11e3-81f5-5deb8b2855fe.png)