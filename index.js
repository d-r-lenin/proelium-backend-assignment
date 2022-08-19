require("dotenv").config(); // Load .env file

//Loading dependencies
const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const app = express();

//Loading middlewares
const { auth  } = require("./helpers/middlewares");

// using middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Addind routes
app.use("/add", require("./routes/add"));
app.use("/get", require("./routes/get"));
app.use("/update", require("./routes/update"));

//Connecting to database
mongoose.connect(process.env.DB_STRING, (e) => {
    //Check if there is an error
    if (e) {
        console.log(e);
        return;
    }
    //only if there is no error then start the server 
    app.listen(PORT, () => {
        console.log("on port::" + PORT);
    })
    
});


app.get("/", auth, (req, res) => {
    res.json({
        message: "Hello World"
    });
});
