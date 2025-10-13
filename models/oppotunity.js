 const mongoose=require("mongoose");
 const {Schema}=mongoose;
 const apnaInternDB = mongoose.connection.useDb('apnaIntern');

 const opportunitySchema = new Schema({
    type: String,
    title: String,
    location: String,
    // add other fields as needed
  });

const Opportunity=apnaInternDB.model("opportunity",opportunitySchema);

module.exports=Opportunity;
