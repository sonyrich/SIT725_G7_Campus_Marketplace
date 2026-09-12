require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const express = require('express'); //requiring express
const connectDB= require('./config/db');
const cors = require('cors');


const PORT = process.env.PORT || 3000;

const app = express(); //calling express

connectDB()
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));


app.get('/',(req,res)=>{
    res.send("API testing and running properly");
})

// error handler must be registered LAST, after every route
app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`APP is running on port ${PORT}`);
})

