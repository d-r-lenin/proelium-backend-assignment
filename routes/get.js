const express = require('express');
const jwt = require('jsonwebtoken');

const uc = require('../helpers/UserControl');

const router = express.Router();

const { auth, adminsOnly } = require('../helpers/middlewares');

//searching for a user by fields
router.get('/one/by/fields', auth, async (req, res) => {
    try {
        const fields = req.body.fields || req.query.fields;
        const objectToSearch = req.body.searchBy;
        if (req.user.role === 'user') {
            objectToSearch.role = 'user';
        }
        console.log({
            ...objectToSearch, 
            // to make sure that only admin can search for admins
        });
        let user = await uc.getOneByFields({
            ...objectToSearch, 
            // to make sure that only admin can search for admins
        });
        
        if (user === null) {
            res.status(400).json({
                message: "User not found"
            });
            return;
        }
        if(fields){
            user = uc.filter(user,fields);
        }
    
        res.status(200).json(user);
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }

});

//searching for all users by fields
router.get('/all/by/fields', auth, async (req, res) => {
    const fields = req.body.fields;;
    const objectToSearch = req.body.searchBy;
    if (req.user.role === 'user') {
        objectToSearch.role = 'user';
    }
    try{
        const users = await uc.getAllByFields({
            ...objectToSearch
        });
        if (users === null) {
            res.status(400).json({
                message: "Users not found"
            });
            return;
        }

        let results;
        //if users is an empty array then skipping the itaration
        if(fields && users.length > 0){
            results = users.forEach( user => uc.filter(user,fields) );
        }else{
            results = users;
        }
        
        res.status(200).json(results);
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});


//to get a User or Admin by id
router.get('/one/by/id/:id', auth, async (req, res) => {
    try{
        const id = req.params.id || req.query.id || req.body.id;
        const fields = req.body.fields; 
        let user = await uc.getById(id);
        
        
        if (user === null) {
            res.status(400).json({
                message: "User not found"
            });
            return;
        }
        //checks if the user has required privileges to get the data
        if(req.user.role !== 'admin' || user.role === 'admin'){
            res.status(403).json({
                message:"Admin privilages required to perform this action"
            });
            return;
        }

        if(fields){
            user = uc.filter(user, fields)
        }

        res.status(200).json(user);

    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});


//to get a User/Admin selves
router.get('/self', auth, async (req, res) => {
    try{
        let user = await uc.getById(req.user.id);
        if(req.body.fields){
            //if prefered fields are given
            user = uc.filter(user, req.body.fields);
        }

        res.status(200).json(user);
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});

//to get a User by Role
router.get('/all/by/role/:role', auth, async(req, res) => {
    const role = req.params.role || req.query.role || req.body.role;
    const fields = req.body.fields;
    
    let results;
    try{
        if(req.user.role !== 'admin' && req.user.role !== role){
            //if the user is not admin and is trying get the admins data
            res.status(403).json({
                message:"Admin privileges required to perform this action" 
            });
            return;
        }

        const users = await uc.getAllByRole(role);
        if(fields){
            // if preferred fields are given then map only those fields to results
            results = users.map((user) => uc.filter(user, fields));

        }else{
            results = users;
        }
        
        res.status(200).json(results);

    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});



//get all users and admins
router.get('/all',auth, adminsOnly, async(req,res)=>{
    const { fields } = req.body;
    let results;
    try{
        //check if user is admin
        const users = await uc.getAll();
        if(fields){
            // if preferred fields are given then map only those fields to results
            results = users.map((user) => uc.filter(user, fields));

        }else{
            results = users;
        }

        res.status(200).json(results);

    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
})

//to get Access token
router.post('/token', async (req,res)=>{
    const { email, password } = req.body;
    //check if email and password are correct 
    try{
        //if correct then generate token
        const userData = await uc.check(email , password);
        //if not exist then throw error to catch block
        if(!userData.email) throw new Error(userData);
        //generating jwt token
        const token = jwt.sign({
                id:userData._id,
                role:userData.role
            },
            process.env.JWT_SECRET
        );
        
        //send token to client
        res.status(200).json({
            token:token
        });

    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});


module.exports = router;