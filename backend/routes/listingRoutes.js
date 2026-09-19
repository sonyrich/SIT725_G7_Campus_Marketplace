const express = require('express');
const router = express.Router();

const {
    createListing,
    getAllListings,
    getSellerContact
} = require('../controllers/listingController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllListings);

router.get(
    '/:id/contact',
    protect,
    getSellerContact
);

router.post(
    '/',
    protect,
    upload.single('image'),
    createListing
);

module.exports = router;