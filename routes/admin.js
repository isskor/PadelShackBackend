const express = require('express');

const router = express.Router();

// middlwares
const { authCheck, adminCheck } = require('../middlewares/auth');

const { orders, orderStatus } = require('../controllers/admin');

// routes
router.get('/admin/orders', authCheck, adminCheck, orders);
router.put('/admin/order', authCheck, adminCheck, orderStatus);

module.exports = router;
