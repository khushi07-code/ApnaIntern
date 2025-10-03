const mongoose=require("mongoose");
const {Schema}=mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');

const intershipSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    requirement:{
        type:String,
        required:true
    },
    location:{
        city: { type: String },
        state: { type: String},
        country: {
            type: String,
            default: "India",
            required:true
        }
    },
    internshiptype:{
        type:String,
        required:true,
        default:"unpaid"
    },
    stipend:{
        type:Number,
        default:0,
    },
    duration:{
        type:Number,
        default:1
    },
    openings:{
        type:Number,
        default:1,
    },
    listingtype: {
        type: String,
        default:"internship"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    postedAt:{
        type:Date,
        default: Date.now(),
    },
});

const Internship=apnaInternDB.model("internship",intershipSchema);


module.exports=Internship;
