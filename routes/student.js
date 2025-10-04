const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const Internship=require("../models/internship.js");
const { optionstudent, isLoggedIn } = require("../utils/middleware.js");
const Application=require("../models/application.js");
const Company=require("../models/company.js");
const Student = require("../models/student.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage });

router.get("/",wrapAsync(async(req,res)=>{
    const internships=await Internship.find({}).limit(4);
    const jobs=await Job.find({}).limit(4);
    const student=await Student.find({studentId:req.user.id});
    res.render("student.ejs",{internships,jobs,student});
}));

router.get("/myapplication",isLoggedIn,wrapAsync(async(req,res)=>{
    let applications=await Application.find({userId:req.user._id})
    console.log(applications);
    let requestlist = await Promise.all(
    applications.map(async (e) => {
            if(e.internshipId){
                return await Internship.findById(e.internshipId);
            }else{
                return await Job.findById(e.jobId);
            }
    }));
    let internjobCompanylist = await Promise.all(
        applications.map(async (e) => {
            let companyid;
            if(e.internshipId){
                let internship=await Internship.findById(e.internshipId);
                companyid=internship.owner;
            }else{
                let job=await Job.findById(e.jobId);
                companyid=job.owner;
            }
           let company =await Company.find({companyId:companyid});
           return company;
       }));
    internjobCompanylist = internjobCompanylist.flat();
    requestlist=requestlist.flat();
    res.render("student/application.ejs",{applications,requestlist,internjobCompanylist});
}));

router.get("/details",isLoggedIn,(req,res)=>{
    res.render("student/studentprofile.ejs");
});

router.post("/details",upload.single("list[resumeUrl]"),wrapAsync(async(req,res)=>{
    const rawSkills = req.body.list.skills;
    const skillsArray = rawSkills.split(',').map(skill => skill.trim()).filter(Boolean);
    req.body.list.skills=skillsArray;
    let list=req.body.list;
    list.resumeUrl=req.file.path;
    list.studentId=req.user.id;
    let student=new Student(list);
    
    let saved=await student.save();
    if(saved){
        req.flash("success","Welcome to ApnaIntern!");
        res.redirect("/Student");
    }
}));
router.get("/profile",isLoggedIn,wrapAsync(async(req,res)=>{
    let User=req.user;
    console.log(User);
    let student=await Student.find({studentId:req.user.id});
    console.log(student,"hello");
    res.render("student/studentprofiledetails.ejs",{student,User});
}));

module.exports=router;