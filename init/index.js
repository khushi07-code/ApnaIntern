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
    await mongoose.connect("mongodb://127.0.0.1:27017/apnaintern");
}
main().then((res)=>{
    console.log(res);
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});


async function initData(){
    await Internship.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await Student.deleteMany({});
    await Internship.insertMany(Interndata);
    await Job.insertMany(Jobdata);
    await Company.insertMany(companydata);
    await Student.insertMany(studentdata);
    console.log("data successfully loaded");
}

initData();