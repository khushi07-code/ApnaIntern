
const mongoose=require("mongoose");
const {Schema}=mongoose;
const apnaInternDB = mongoose.connection.useDb('apnaIntern');

const faqSchema = new Schema({
    question: String,
    answer: String,
  });
  
const FAQ=apnaInternDB.model("faq",faqSchema);

module.exports=FAQ;
