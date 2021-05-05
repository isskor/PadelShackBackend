const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const { create, remove, list } = require('../controllers/coupon');

// route
router.post('/coupon', authCheck, adminCheck, create);
router.get('/coupons', authCheck, adminCheck, list);
router.delete('/coupon/:coupon', authCheck, adminCheck, remove);

module.exports = router;
