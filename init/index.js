if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const mongoose=require("mongoose");
async function main(){
    console.log(process.env.MONGODBURL);
    await mongoose.connect(process.env.MONGODBURL);
}
main().then((res)=>{
    console.log(res);
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});



const Internship=require("../models/internship.js");
const Job=require("../models/job.js");
const Company=require("../models/company.js");
const Interndata=require("./internship/data.js");
const Jobdata=require("./jobs/data.js");
const companydata=require("./company/data.js");

const fixedJobData = Jobdata.map(job => ({
  ...job,
  owner: mongoose.Types.ObjectId.isValid(job.owner)
    ? new mongoose.Types.ObjectId(job.owner)
    : undefined // or handle error
}));
const fixedinternbData = Interndata.map(intern => ({
  ...intern,
  owner: mongoose.Types.ObjectId.isValid(intern.owner)
    ? new mongoose.Types.ObjectId(intern.owner)
    : undefined // or handle error
}));
const fixedcompanyData = companydata.map( company=> ({
  ...company,
  owner: mongoose.Types.ObjectId.isValid(company.companyId)
    ? new mongoose.Types.ObjectId(company.companyId)
    : undefined // or handle error
}));

async function initData(){
    await Internship.deleteMany();
    await Job.deleteMany();
    await Company.deleteMany();
    await Internship.insertMany(fixedinternbData);
    await Job.insertMany(fixedJobData);
    await Company.insertMany(fixedcompanyData);
    console.log("data successfully loaded");
}

initData();