const express = require('express');

const router = express.Router();

const {
    createReport
} = require('../controllers/reportController');

const {
    protect
} = require('../middleware/authMiddleware');


// FR-14: Report a listing
router.post(
    '/',
    protect,
    createReport
);


module.exports = router;