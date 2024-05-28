
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// console.log("stipeApiKey",process.env.STRIPE_API_KEY)


// Process payment
exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'inr',
    metadata: { integration_check: 'accept_a_payment' },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

// Send Stripe API key
// exports.sendStripeApi = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const stripeApiKey = process.env.STRIPE_API_KEY;
//     if (!stripeApiKey) {
//       console.error('Stripe API key not found in environment variables');
//       return res.status(500).json({
//         success: false,
//         message: 'Stripe API key not found',
//       });
//     }

//     res.status(200).json({
//       stripeApiKey,
//     });
//   } catch (error) {
//     console.error('Error in sendStripeApi function:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//     });
//   }
// });


// exports.sendStripeApi = catchAsyncErrors(async (req, res, next) => {
//   const stripeApiKey = process.env.STRIPE_API_KEY;
//   console.log("stipeApiKey",stripeApiKey)
//   if (!stripeApiKey) {
//     return res.status(500).json({
//       success: false,
//       message: 'Stripe API key not found',
//     });
//   }

//   res.status(200).json({
//     stripeApiKey,
//   });
// });


exports.sendStripeApi = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
      stripeApiKey: process.env.STRIPE_API_KEY,
  });
});