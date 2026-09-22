const express = require('express');
const router = express.Router();

const {
    getAdminListings,
    deleteListingAsAdmin
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get(
    '/listings',
    protect,
    adminOnly,
    getAdminListings
);

router.delete(
    '/listings/:id',
    protect,
    adminOnly,
    deleteListingAsAdmin
);

module.exports = router;