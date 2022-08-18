require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const User = require('./models/Users');

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.DB_STRING, (e) => {
    if (e) {
        console.log(e);
        return;
    }
    app.listen(PORT, () => {
        console.log("on port::" + PORT);
    })
    
});


app.get("/", (req, res) => {
    res.send("Hello World!");
});

