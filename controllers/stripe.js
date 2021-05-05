const User = require('../models/user');
const Coupon = require('../models/coupon');
const Cart = require('../models/cart');
const Product = require('../models/product');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createPayment = async (req, res) => {
  // todo apply coupon
  // calculate price
  const { couponApplied } = req.body;
  console.log(req.body);
  // 1 find user
  const user = await User.findOne({ email: req.user.email }).exec();
  // 2 get user cart total
  const { cartTotal, totalAfterDiscount } = await Cart.findOne({
    orderedBy: user._id,
  }).exec();

  console.log('cartTotal', cartTotal);
  console.log('cartTotalDC', totalAfterDiscount);
  // 3 create payment intent with order amount and currency

  let finalAmount = 0;
  if (couponApplied && totalAfterDiscount) {
    finalAmount = totalAfterDiscount * 100;
  } else {
    finalAmount = cartTotal * 100;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: 'usd',
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
    cartTotal,
    totalAfterDiscount,
    payable: finalAmount,
  });
};
