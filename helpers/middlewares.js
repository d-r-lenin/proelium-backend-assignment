
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
            //converting role to lowercase for further use
            decoded.role = decoded.role.toLowerCase();
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

const adminsOnly = (req, res, next) => {
    //check if user is admin
    if(req.user.role === 'admin'){
        next();
    }else{
        res.status(403).json({
            message:"Admin privileges required to perform this action"
        });
    }
}

const   dataRequired = (req, res, next) => {
    //functions to reduce complexity of conditions
    function isValidStructure() {
        return req.body.firstName &&
            req.body.lastName &&
            req.body.email &&
            req.body.password &&
            req.body.confirmPassword &&
            req.body.role;
    }

    function isPasswordLengthValid() {
        return req.body.password.length >= 6 &&
            req.body.password.length <= 12;
    }
    
    //check if data is present
    if(!req.body){
        res.status(400).json({
            message:"No data provided"
        });
        return;
    }

    if(!isValidStructure){
        //checks if all required fields are present
        res.status(400).json({
            message:"Some required fields are missing"
        });
        return;
    
    }else if(!isPasswordLengthValid()){
        //checks if password is in valid length 
    
        res.status(400).json({
            message:"Password length should be between 6 to 12 characters"
        });
        return;
    
    }else if(!req.body.password === req.body.confirmPassword){
        //checks if password and confirmPassword are same
        
        res.status(400).json({
            message:"Password and Confirm Password are not same"
        });
        return;

    }

    next();

    
}


module.exports = {
    auth,
    adminsOnly,
    dataRequired
}