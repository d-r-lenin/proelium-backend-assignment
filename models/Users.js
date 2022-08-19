const { model, Schema } = require('mongoose');


const userSchema = new Schema({
    firstName : {
        required: true,
        type: "string"
    },
    middleName : {
        type: "string"
    },
    lastName : {
        required: true,
        type: "string"
    },
    email : {
        required: true,
        type: "string"
    },
    password : {
        required: true,
        type: "string"
    },
    role : {
        required: true,
        type: "string"
    },
    department : {
        type: "string"
    }
},
{
    timestamps:{
        created_time: 'created_at',
        updated_time: 'updated_at'
    }
});

const User = model('user',userSchema);

module.exports = User;