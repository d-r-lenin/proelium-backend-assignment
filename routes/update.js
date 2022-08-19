const express = require('express');

const router = express.Router();

const { auth } = require('../helpers/middlewares');

const uc = require('../helpers/UserControl');

//update user by id
router.put(
    '/by/id/:id', 
    auth,
    async (req, res) => {
        const id = req.params.id;
        const updateWith = req.query;
        try{
            let data = await uc.getById(id);

            if(!data){
                res.status(404).json({
                    message: "User not found"
                });
                return;
            }
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
            
            const user = await uc.update(id,updateWith);

            //sending a updated user object in database
            res.status(200).json(user);
            
        }catch(e){
            console.log(e);
            res.status(500).json({
                message:"Internal Server Error"
            });
        }

    }
);



router.put('/self', auth, async (req, res) => {
    const updateWith = req.query;
    try{
        const user = await uc.update(req.user.id, updateWith);
        res.status(200).json(user);
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
});


module.exports = router;