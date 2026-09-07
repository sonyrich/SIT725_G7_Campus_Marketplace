//we define the User Schema in this
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim:true,
    },
    
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true,  
    },

    studentID:{
        type: String,
        required: true,
        trim: true
    },
    
    role:{
        type: String,
        enum:['user','admin'],
        default:'user'
    }
    
},{timestamps:true} //automatically adds the two fields createdAt and UpdatedAt
);

module.exports = mongoose.model("User",userSchema); //export it, so can use it in other files