const Listing = require('../models/listing');

// Get all listings for admin review
const getAdminListings = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate('seller', 'fullName email studentID')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });

    } catch (error) {
        console.error('Admin get listings error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching listings'
        });
    }
};

// Delete a listing as admin
const deleteListingAsAdmin = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        await Listing.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Listing removed by admin'
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        console.error('Admin delete listing error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while deleting listing'
        });
    }
};

module.exports = {
    getAdminListings,
    deleteListingAsAdmin
};