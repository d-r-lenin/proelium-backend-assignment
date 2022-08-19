require("dotenv").config(); // Load .env file

//Loading dependencies
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//Loading userControl object as 'uc'
const uc = require("./helpers/UserControl");


const PORT = process.env.PORT || 3000;

const app = express();

//Loading middlewares
const { auth , adminsOnly } = require("./helpers/middlewares");

// using middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Addind routes
app.use("/add", require("./routes/add"));

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
    res.send("WellCome!!");
});


//to get a User or Admin
app.get('/view',(req,res)=>{
    const id = req.query.id;
    uc.get(id).then((user)=>{
        res.status(200).json({
            user:user
        });
    }).catch((e)=>{
        res.status(400).json({
            message:"User not found"
        });
    });
});

//to update User or admin
app.put('/update',(req,res)=>{
    const id = req.query.id;
    const data = req.body;
    uc.update(id,data);
    res.status(200).json({
        message:"User updated"
    });
});


//to get Access token
app.post('/get/token', async (req,res)=>{
    const { email, password } = req.body;
    //check if email and password are correct 
    try{
        //if correct then generate token
        const userData = await uc.check(email , password);

        //if not exist then throw error to catch block
        if(userData === null) throw new Error("User not found");
        
        const token = jwt.sign({
                id:userData._id,
                role:userData.role
            },
            process.env.JWT_SECRET
        );
        
        //send token to user
        res.status(200).json({
            token:token
        });

    }catch(e){
        res.status(400).json({
            message:"User not found"
        });
    };
});

//get all users and admins
app.get('/get/all', auth, adminsOnly, async(req,res)=>{
    //check if user is admin
    const users = await uc.getAll();
    res.status(200).json({
        users:users
    });

})