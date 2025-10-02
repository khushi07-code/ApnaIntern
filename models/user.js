const mongoose = require('mongoose');
const { Schema } = mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');
const passportlocalmongoosge=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    usertype:{
        type:String,
        required:true
    }
});

userSchema.plugin(passportlocalmongoosge);

const User=apnaInternDB.model("user",userSchema);
module.exports=User;