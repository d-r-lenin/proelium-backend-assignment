const bcrypt = require('bcrypt');

const saltRounds = 10;

//Load Models
const User = require('../models/Users');

//Controller Object to perform users related operations
class UserControl {
    constructor() {
        //Model is a mongoose model for Users
        this.Model = User;
    }
    
    async add(data) {
        // checks if user is already present in the database
        const isValid = await this.isValid(data)
        if(!isValid){
            return null;
        }
        const user = new this.Model(data);
        user.department =  user.department.toLocaleLowerCase();
        user.password = await bcrypt.hash(user.password, saltRounds);
        await user.save();
        user.password = undefined;
        return user;
    }

    async getById(id) {
        return this.Model.findById(id).select('-password').exec();
    }

    async getOneByFields(object){
        try{
            return this.Model.findOne(object).select('-password').exec();
        }catch(e){
            return null;
        }
	}


    async getAllByFields(object){
        try{
            return this.Model.find(object).select('-password').exec();
        }catch(e){
            return null;
        }	
	}

    async getAll() {
        return this.Model.find().select('-password').exec();
    }

    async getAllByRole(role) {
        role = role.toLocaleLowerCase();
        return this.Model.find({ role: role }).select('-password').exec();
    }

    async update(id, data) {
        await this.Model.findByIdAndUpdate(id, data);
    }

    // checks if the given email and password are correct
    async check(email, password) {

        const user = await this.Model.findOne({ email: email });
        if (user === null) return "Email not found";

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return "Wrong Password";

        user.password = undefined;

        return user;
    }

    //to check is a given data is valid to create a new user
    async isValid(user){
        // checks if user is already present in the database
        const isEmailExist = await this.Model.findOne( { 
            email: user.email 
        });

        // checks all required fields are present 
        const isValid = (
            isEmailExist &&
            user.firstName &&
            user.lastName &&
            user.email &&
            user.role
        );
        
        if(!isValid){
            return false;
        } else {
            // changing role to lowercase to avoid case sensitive
            user.role = user.role.toLocaleLowerCase();
            return true
        }
    }

    filter(user, fields) {
        let result = {};
        fields.forEach((field) => {
            result[field] = user[field];
        });
        return result;
    }


}

const userControl = new UserControl();
module.exports = userControl;