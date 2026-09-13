const express = require('express');
const router = express.Router();

const {
    createListing,
    getAllListings,
} = require("../controllers/listingController");
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllListings);

router.post(
    '/',
    protect,
    upload.single('image'),
    createListing
);

module.exports = router;