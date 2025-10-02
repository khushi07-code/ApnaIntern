const mongoose = require('mongoose');
const { Schema } = mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');

const companySchema=new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    location: {
        city: { type: String },
        state: { type: String },
        country: {
            type: String,
            default: "India"
        }
    },
    website: {
        type: String,
        required: true,
        match: /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/
    },
    contactNumber: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
    },
    companyDetails: {
        type: String,
        required: true
    },
    typeOf:{
        type:String,
        required:true
    }
});


const Company=apnaInternDB.model("company",companySchema);
module.exports=Company;