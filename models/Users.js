const { model, Schema } = require('mongoose');



const userSchema = new Schema({
    first_name : {
        required: true,
        type: "string"
    },
    middle_name : {
        type: "string"
    },
    last_name : {
        required: true,
        type: "string"
    },
    email : {
        required: true,
        type: "string"
    },
    hash : {
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