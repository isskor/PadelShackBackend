const express = require('express');

const router = express.Router();

const { authCheck } = require('../middlewares/auth');

const { createPayment } = require('../controllers/stripe');

router.post('/create-payment', authCheck, createPayment);

module.exports = router;
