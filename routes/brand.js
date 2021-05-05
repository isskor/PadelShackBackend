const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const { create, read, update, remove, list } = require('../controllers/brand');

// route
router.post('/brand', authCheck, adminCheck, create);
router.get('/brand', list);
router.get('/brand/:slug', read);
router.put('/brand/:slug', authCheck, adminCheck, update);
router.delete('/brand/:slug', authCheck, adminCheck, remove);

module.exports = router;
