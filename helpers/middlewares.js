
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    //getting token 
    const token = req.body.token || req.query.token || req.header['x-access-token'];

    try{
        //check if token is present
        if(!token) throw new Error("Token not found");

        //verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            //if token is not valid then throw error
            if(err)throw new Error("Token not valid");
            //if token is valid then set user to req.user
            req.user = decoded;
            next();
        });
    }catch(e){
        //send Error messages
        res.status(400).json({
            message:e.message
        });
        return;
    }
}




module.exports = {
    auth
}