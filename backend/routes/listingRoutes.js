const express = require('express');
const router = express.Router();

const { createListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post(
    '/',
    protect,
    upload.single('image'),
    createListing
);

module.exports = router;