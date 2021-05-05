const express = require('express');

const router = express.Router();

const { authCheck } = require('../middlewares/auth');

const {
  userCart,
  getUserCart,
  emptyCart,
  setAddress,
  applyCouponToUserCart,
  createOrder,
  getOrders,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/user');
// test
// router.get('/user', (req, res) => {
//   res.json({
//     data: 'user api endpoint',
//   });
// });
// cart
router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.delete('/user/cart', authCheck, emptyCart);
router.post('/user/address', authCheck, setAddress);
// coupon
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart);

//  order Routes
router.post('/user/order', authCheck, createOrder);
router.get('/user/orders', authCheck, getOrders);

// whishlist
router.post('/user/wishlist', authCheck, addToWishlist);
router.get('/user/wishlist', authCheck, getWishlist);
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist);

module.exports = router;
