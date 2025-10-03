const mongoose=require("mongoose");
const Internship=require("../models/internship.js");
const Job=require("../models/job.js");
const Company=require("../models/company.js");
const Interndata=require("./internship/data.js");
const Jobdata=require("./jobs/data.js");
const companydata=require("./company/data.js");
const studentdata=require("./student/data.js");
const Student = require("../models/student.js");

async function main(){
    await mongoose.connect(process.env.MONGODBURL);
}
main().then((res)=>{
    console.log(res);
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});


async function initData(){
    await Internship.insertMany(Interndata);
    await Job.insertMany(Jobdata);
    await Company.insertMany(companydata);
    console.log("data successfully loaded");
}

initData();