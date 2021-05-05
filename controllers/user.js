const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');
const Order = require('../models/order');

exports.userCart = async (req, res) => {
  console.log('USERCART');
  const { cart } = req.body;
  console.log(7, cart);
  console.log('usercart 8', req.body);
  let products = [];

  const user = await User.findOne({ email: req.user.email }).exec();
  //   check if cart with logged in user id already exist
  console.log('c');

  let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();

  console.log('b');
  if (cartExistByThisUser) {
    // remove to later replace with new
    cartExistByThisUser.remove();
  }
  console.log('a');
  for (let i = 0; i < cart.length; i++) {
    let cartObj = {};

    cartObj.product = cart[i]._id;
    cartObj.count = cart[i].count;
    cartObj.color = cart[i].color;
    // get price for creating total
    let productFromDb = await Product.findById(cart[i]._id)
      .select('price')
      .exec();
    console.log(productFromDb);
    cartObj.price = productFromDb.price;

    products.push(cartObj);
  }
  //   console.log('products', products);

  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  //   console.log('cartTotal', cartTotal);

  let newCart = await new Cart({
    products,
    cartTotal,
    orderedBy: user._id,
  }).save();

  console.log('new cart', newCart);

  res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
  console.log('GET USER CART');
  const user = await User.findOne({ email: req.user.email }).exec();

  let cart = await Cart.findOne({ orderedBy: user._id })
    .populate('products.product', '_id title price totalAfterDiscount')
    .exec();
  console.log('getusercart', cart);
  const { products, cartTotal, totalAfterDiscount } = cart;
  res.json({ products, cartTotal, totalAfterDiscount });
};

exports.emptyCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();

  res.json(cart);
};

exports.setAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate(
    { email: req.user.email },
    { address: req.body.address }
  ).exec();

  res.json({ ok: true });
};

exports.applyCouponToUserCart = async (req, res) => {
  const { coupon } = req.body;
  console.log('COUPON', coupon);

  const validCoupon = await Coupon.findOne({ name: coupon }).exec();

  if (validCoupon === null) {
    console.log('not valid coupon');
    return res.json({ err: 'Invalid Coupon' });
  }

  console.log('VALID COUPON', validCoupon);

  const user = await User.findOne({ email: req.user.email }).exec();

  const { products, cartTotal } = await Cart.findOne({ orderedBy: user._id })
    .populate('products.products', '_id title price')
    .exec();

  console.log('cartTotal', cartTotal, 'discount%', validCoupon.discount);

  // calculate total after discount
  let totalAfterDiscount = (
    cartTotal *
    ((100 - validCoupon.discount) / 100)
  ).toFixed(2);

  await Cart.findOneAndUpdate(
    { orderedBy: user._id },
    { totalAfterDiscount },
    { new: true }
  ).exec();

  res.json(totalAfterDiscount);
};

exports.createOrder = async (req, res) => {
  // console.log(req.body)
  const paymentIntent = req.body.stripeResponse;
  const user = await User.findOne({ email: req.user.email }).exec();

  let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

  let newOrder = await new Order({
    products,
    paymentIntent,
    orderedBy: user._id,
  }).save();

  // decrement inventory quantity, increment sold
  let bulkOption = products.map((p) => {
    return {
      updateOne: {
        filter: { _id: p.product._id },
        update: { $inc: { quantity: -p.count, sold: +p.count } },
      },
    };
  });
  const updated = await Product.bulkWrite(bulkOption, {});
  console.log('updated Q AND SOLD--->', updated);

  res.json({ ok: true });
};

exports.getOrders = async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).exec();
  let userOrders = await Order.find({ orderedBy: user._id })
    .populate({
      path: 'products',
      populate: {
        path: 'product',
        component: 'products',
        populate: {
          path: 'color',
          component: 'Color',
        },
      },
    })
    .exec();

  console.log(JSON.stringify(userOrders, null, 4));
  res.json(userOrders);
};

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();
  res.json({ ok: true });
};

exports.getWishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select('wishlist')
    .populate('wishlist')
    .exec();

  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};
