const bcrypt = require('bcrypt');

const saltRounds = 10;

//Load Models
const User = require('../models/Users');

//Controller Object to perform users related operations
class UserControl {
    constructor() {
        //Model is a mongoose model for Users
        this.Model = User;
        this.getAllByFields({email: "test@test.com"}).then( data =>{
            if(data.length === 0){
                this.add({
                    firstName: "Admin",
                    lastName: "Admin",
                    email: "test@test.com",
                    password: "password",
                    confirmPassword: "password",
                    role: "admin",
                    department: "IT"
                });
            }
        });
        
    }
    
    async add(data) {
        // checks if user is already present in the database
        const isValid = await this.isValid(data)
        console.log("data is valid:",isValid);

        if(!isValid){
            return null;
        }
        const user = new this.Model(data);
        
        if(user.department){
            user.department =  user.department.toLocaleLowerCase();
        }

        // hashing the password using bcrypt
        user.password = await bcrypt.hash(user.password, saltRounds);
        console.log("data is encripted:");
        console.log(user);
        console.log(await user.save());
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
        //deleting any fields that are not allowed to be updated
        delete data.password ;
        delete data.createdAt;
        delete data.updatedAt;
        delete data.role;
        try {
	        await this.Model.findByIdAndUpdate(id, data);
	        return this.getById(id);
        } catch (e) {
            console.log(e);
            return null;
        }
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
        if(isEmailExist){
            console.log("email exist")
            console.log(isEmailExist);
        }

        // checks all required fields are present 
        const isValid = (
            !isEmailExist &&
            !!user.firstName &&
            !!user.lastName &&
            !!user.email &&
            !!user.role
        );
        console.log(isValid)
        
        if(!isValid){
            return false;
        } else {
            // changing role to lowercase to avoid case sensitive
            user.role = user.role.toLowerCase();
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