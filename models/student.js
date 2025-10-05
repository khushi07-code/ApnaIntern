const mongoose = require('mongoose');
const { Schema } = mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');

const studentSchema= new Schema({
    studentId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    name:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:["female","male","other"]
    },
    address:{
        type:String
    },
    college: {
        type:String
    },
    course:{
        type:String
    },
    branch:{
        type:String
    },
    semester:{
        type:Number,
        min:1,
        max:8
    },
    skills:{
        type:[String]
    },
    resumeUrl:{
        url:{
            type:String,
            required:true
        },
        filename:String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Student=apnaInternDB.model("student",studentSchema);
module.exports=Student;
 

