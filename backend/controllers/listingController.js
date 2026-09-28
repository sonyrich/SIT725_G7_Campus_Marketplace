const fs = require('fs');
const Listing = require('../models/listing');


const cleanupUploadedFile = (file) => {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};


function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// --------------------------------------------------
// Get all listings
// --------------------------------------------------
const getAllListings = async (req, res) => {
    try {
        const { category, search } = req.query;

        if (
            (category !== undefined && typeof category !== 'string') ||
            (search !== undefined && typeof search !== 'string')
        ) {
            return res.status(400).json({
                success: false,
                message: 'category and search must be single string values'
            });
        }

        const filter = {
            status: 'available'
        };

        if (category) {
            filter.category = category;
        }

        // Search Listings by Keyword (FR-06) [6] (Sony)
        if (search) {
            const safeSearch = escapeRegex(search.trim());

            if (safeSearch.length > 0) {
                const keywordRegex = { $regex: safeSearch, $options: 'i' };

                // Match the keyword against title OR description OR category,
                // so buyers can find items using any relevant word — not just
                // words that happen to appear in the title.
                filter.$or = [
                    { title: keywordRegex },
                    { description: keywordRegex },
                    { category: keywordRegex }
                ];
            }
        }


        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });

    } catch (error) {
        console.error('Get listings error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching listings'
        });
    }
};


// --------------------------------------------------
// FR-09: Get one listing by ID
// --------------------------------------------------
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: listing
        });

    } catch (error) {
        console.error('Get listing error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching listing'
        });
    }
};


// --------------------------------------------------
// Create listing
// --------------------------------------------------
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


// --------------------------------------------------
// FR-09: Update listing
// --------------------------------------------------
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            cleanupUploadedFile(req.file);

            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Only the owner can edit their listing
        if (listing.seller.toString() !== req.user._id.toString()) {
            cleanupUploadedFile(req.file);

            return res.status(403).json({
                success: false,
                message: 'You are not allowed to edit this listing'
            });
        }

        const {
            title,
            description,
            price,
            category,
            condition
        } = req.body || {};


        if (title !== undefined) {
            if (!title.trim() || title.trim().length < 2) {
                cleanupUploadedFile(req.file);

                return res.status(400).json({
                    success: false,
                    message: 'Title must contain at least 2 characters'
                });
            }

            listing.title = title.trim();
        }


        if (description !== undefined) {
            if (
                !description.trim() ||
                description.trim().length < 2
            ) {
                cleanupUploadedFile(req.file);

                return res.status(400).json({
                    success: false,
                    message: 'Description must contain at least 2 characters'
                });
            }

            listing.description = description.trim();
        }


        if (price !== undefined) {
            const numericPrice = Number(price);

            if (
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                cleanupUploadedFile(req.file);

                return res.status(400).json({
                    success: false,
                    message: 'Price must be a valid non-negative number'
                });
            }

            listing.price = numericPrice;
        }


        if (category !== undefined) {
            if (!category.trim()) {
                cleanupUploadedFile(req.file);

                return res.status(400).json({
                    success: false,
                    message: 'Category is required'
                });
            }

            listing.category = category.trim();
        }


        if (condition !== undefined) {
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

            listing.condition = condition;
        }


        // Replace image only if a new one is uploaded
        if (req.file) {
            listing.imageUrl = `/uploads/${req.file.filename}`;
        }


        await listing.save();


        return res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: listing
        });

    } catch (error) {
        cleanupUploadedFile(req.file);

        console.error('Update listing error:', error);

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
            message: 'Server error while updating listing'
        });
    }
};

// --------------------------------------------------
// FR-13: Mark listing as sold
// --------------------------------------------------
const markListingAsSold = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found.'
            });
        }

        // Only the owner can change their listing's availability
        if (listing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this listing.'
            });
        }

        if (listing.status === 'sold') {
            return res.status(400).json({
                success: false,
                message: 'This listing is already marked as sold.'
            });
        }

        listing.status = 'sold';
        await listing.save();

        return res.status(200).json({
            success: true,
            message: 'Listing marked as sold.',
            data: listing
        });
    } catch (err) {
        console.error('markListingAsSold error:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while updating listing status.'
        });
    }
};

// --------------------------------------------------
// FR-12: Get seller contact details
// --------------------------------------------------
const getSellerContact = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('seller', 'fullName email');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        if (!listing.seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller information not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                sellerName: listing.seller.fullName,
                sellerEmail: listing.seller.email
            }
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        console.error('Contact seller error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching seller contact'
        });
    }
};


module.exports = {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    markListingAsSold,
    getSellerContact
};