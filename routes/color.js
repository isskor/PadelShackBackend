const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const { create, read, update, remove, list } = require('../controllers/color');

// route
router.post('/color', authCheck, adminCheck, create);
router.get('/color', list);
router.get('/color/:slug', read);
router.put('/color/:slug', authCheck, adminCheck, update);
router.delete('/color/:slug', authCheck, adminCheck, remove);

module.exports = router;
