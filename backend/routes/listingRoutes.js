const express = require('express');
const router = express.Router();

const { createListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createListing);

module.exports = router;