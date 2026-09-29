const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true
        },

        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        reason: {
            type: String,
            enum: [
                'inappropriate',
                'suspicious',
                'scam',
                'other'
            ],
            required: true
        },

        details: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },

        status: {
            type: String,
            enum: [
                'pending',
                'reviewed',
                'dismissed'
            ],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Report', reportSchema);