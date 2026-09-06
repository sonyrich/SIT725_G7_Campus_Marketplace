//creating listing schema
const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({

    title:{
        type: String,
        required:true,
        trim:true,
        minlength:2,
    },

    description:{
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    price:{
        type: Number,
        required: true,
        min:0,         
    },

    category:{
        type: String,
        required: true
    },

    condition:{
        type: String,
        enum: ["New","Like New","Good","Fair","Poor"],
        required: true
    },
    
    status:{
        type: String,
        enum: ['available','sold'], default:"available"
    },
    
    imageUrl:{
        type: String
    },

    seller:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }

},{timestamps:true} );

module.exports = mongoose.model("Listing",listingSchema);