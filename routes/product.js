const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const {
  create,
  getProducts,
  remove,
  readProduct,
  updateProduct,
  listProducts,
  getProductsCount,
  productStar,
  getRelated,
  searchFilters,
} = require('../controllers/product');

// route
router.post('/product', authCheck, adminCheck, create);
router.get('/products/total', getProductsCount);
router.get('/products/:count', getProducts);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/product/:slug', readProduct);
router.put('/product/:slug', authCheck, adminCheck, updateProduct);
router.post('/products', listProducts);
// rating
router.put('/product/star/:productId', authCheck, productStar);
router.get('/product/related/:productId', getRelated);
// search
router.post('/search/filters', searchFilters);

module.exports = router;
