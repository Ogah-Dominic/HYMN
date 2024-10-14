require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User =require("./router/user");
const song = require("./router/song");

const app  = express()
app.use(express.json)
app.use("/api/",User);
app.use("/api/",song);

app.use(bodyParser.json())



const DB = process.env.DATABASE
mongoose.connect(DB).then(()=>{
    console.log("Successfully connected to Database")
}).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is now connected to ${process.env.PORT}`)
    })
})
