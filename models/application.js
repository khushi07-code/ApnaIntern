const mongoose = require('mongoose');
const { Schema } = mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');

const applicationSchema=new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
        required: false 
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: false 
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: false 
    },
    Status:{
        type:String,
        enum:["pending","hired","rejected","accepted"],
        default:"pending"
    },
    appliedAt:{
        type:Date,
        default:Date.now()
    }
  
});

const Application=apnaInternDB.model("application",applicationSchema);
module.exports=Application;
