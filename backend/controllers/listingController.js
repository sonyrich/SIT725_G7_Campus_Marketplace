const Listing = require('../models/listing');

const createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition
        } = req.body;

        if (!title || !description || price === undefined || !category || !condition) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required listing fields'
            });
        }

        const listing = await Listing.create({
            title,
            description,
            price,
            category,
            condition,
            seller: req.user._id
        });

        return res.status(201).json({
            success: true,
            data: listing
        });

    } catch (error) {
        console.error('Create listing error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while creating listing'
        });
    }
};

module.exports = {
    createListing
};