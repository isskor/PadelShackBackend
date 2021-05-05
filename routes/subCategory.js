const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const {
  create,
  read,
  update,
  remove,
  list,
} = require('../controllers/subCategory');

// route
router.post('/subCategory', authCheck, adminCheck, create);
router.get('/subCategory', list);
router.get('/subCategory/:slug', read);
router.put('/subCategory/:slug', authCheck, adminCheck, update);
router.delete('/subCategory/:slug', authCheck, adminCheck, remove);

module.exports = router;
