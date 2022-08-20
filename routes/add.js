const express = require('express');

const router = express.Router();

const { auth , dataRequired} = require('../helpers/middlewares');

const uc = require('../helpers/UserControl');

//to add a User or Admin
router.post(
    '/', 
    auth, 
    dataRequired, 
    async (req, res) => {
        try{
            const data = req.body;
            let user;
            //check if user is admin or "user is adding another user"
            const isAuthValid = (
                req.user.role === 'admin' || 
                (
                    req.user.role === 'user' && 
                    data.role     === 'user'
                )
            ); 

            //if user is not admin and is not adding another user
            if(!isAuthValid){
                res.status(403).json({
                    message:"You are not authorized to perform this action"
                });
                return;
            }

            //this function will add user to database and return the user
            // if user already exist or any problem it will return null
            user = await uc.add(data);

            if(user === null){
                res.status(400).json({
                    message:"Can't add the user"
                })
                return;
            }

            //sending a user object that saved in database
            res.status(200).json(user);

        }catch(e){
            console.log(e);
            res.status(500).json({
                message:"Internal Server Error"
            });
        }
    }
);

module.exports = router;