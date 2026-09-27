const Report = require('../models/report');
const Listing = require('../models/listing');


// FR-14: Report a listing
const createReport = async (req, res) => {
    try {
        const { listingId, reason, details } = req.body || {};

        // Check required fields
        if (!listingId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Listing and report reason are required'
            });
        }

        // Check that the listing exists
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Validate report reason
        const allowedReasons = [
            'inappropriate',
            'suspicious',
            'scam',
            'other'
        ];

        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report reason'
            });
        }

        // Validate optional details
        if (
            details !== undefined &&
            typeof details !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Report details must be text'
            });
        }

        if (
            details &&
            details.trim().length > 500
        ) {
            return res.status(400).json({
                success: false,
                message: 'Report details cannot exceed 500 characters'
            });
        }

        // Create report linked to listing and authenticated user
        const report = await Report.create({
            listing: listing._id,
            reporter: req.user._id,
            reason,
            details: details ? details.trim() : '',
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Listing reported successfully',
            data: report
        });

    } catch (error) {
        console.error('Create report error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid report data'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while reporting listing'
        });
    }
};


module.exports = {
    createReport
};