require('dotenv').config();

const express = require('express'); //requiring express
const connectDB= require('./config/db');
const cors = require('cors');


const PORT = process.env.PORT;

const app = express(); //calling express

connectDB()
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/',(req,res)=>{
    res.send("API testing and running properly");
})

app.listen(PORT, ()=>{
    console.log(`APP is running on port${PORT}`);
})
