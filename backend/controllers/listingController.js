const fs = require('fs');
const Listing = require('../models/listing');

const cleanupUploadedFile = (file) => {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

const createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition
        } = req.body || {};

        if (
            !title ||
            !description ||
            price === undefined ||
            !category ||
            !condition
        ) {
            cleanupUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: 'Please provide all required listing fields'
            });
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            cleanupUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: 'Price must be a valid non-negative number'
            });
        }

        const allowedConditions = [
            'New',
            'Like New',
            'Good',
            'Fair',
            'Poor'
        ];

        if (!allowedConditions.includes(condition)) {
            cleanupUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: 'Invalid listing condition'
            });
        }

        const listing = await Listing.create({
            title: title.trim(),
            description: description.trim(),
            price: numericPrice,
            category: category.trim(),
            condition,
            imageUrl: req.file
                ? `/uploads/${req.file.filename}`
                : undefined,
            seller: req.user._id
        });

        return res.status(201).json({
            success: true,
            data: listing
        });

    } catch (error) {
        cleanupUploadedFile(req.file);

        console.error('Create listing error:', error);

        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing data'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating listing'
        });
    }
};

module.exports = { createListing };