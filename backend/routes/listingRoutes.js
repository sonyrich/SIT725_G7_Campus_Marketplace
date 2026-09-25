const express = require('express');

const router = express.Router();

const {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    getSellerContact
} = require('../controllers/listingController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// Get all listings
router.get('/', getAllListings);


// Get seller contact
router.get(
    '/:id/contact',
    protect,
    getSellerContact
);


// Get one listing
router.get(
    '/:id',
    getListingById
);


// Create listing
router.post(
    '/',
    protect,
    upload.single('image'),
    createListing
);


// Edit listing
router.put(
    '/:id',
    protect,
    upload.single('image'),
    updateListing
);


module.exports = router;