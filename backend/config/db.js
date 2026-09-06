//Creating database connection
const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongoose Connected");
    } catch (error) {
        console.log("Mongoose connection failed",error.message);
        process.exit(1);
    }
}

module.exports = connectDB; //exporting this so that it can use in other files.