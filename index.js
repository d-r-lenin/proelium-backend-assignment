require("dotenv").config(); // Load .env file

//Loading dependencies
const express = require("express");
const mongoose = require("mongoose");

const uc = require("./helpers/UserControl");

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


app.get("/", async(req, res) => {
    // to create initial admin user for now
    let user = await uc.getOneByFields({ email: "test@test.com " });
    if (!user) {
        user = await uc.add({
            firstName: "admin",
            lastName: "new",
            email: "test@test.com",
            password: "password",
            confirmPassword: "password",
            role: "admin"
        });
    }  

    res.json({
        email: "test@test.com",
        password: "password",
        role : "admin",
        message: "This is the account for testing purposes in development. Get the authorization token by POST email and password to '/get/token' and use it in the headers of the request. The key is 'Authorization' and the value is 'Bearer <token>'"
    });

});
