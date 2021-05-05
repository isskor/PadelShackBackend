const express = require('express');

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// controllers
const { remove, upload } = require('../controllers/cloudinary');
// routes

router.post('/uploadimages', authCheck, adminCheck, upload);
router.post('/removeimage', authCheck, adminCheck, remove);

module.exports = router;
