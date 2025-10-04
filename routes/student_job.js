const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const { isLoggedIn, isapplied, savedbackpath, saveredirectUrl } = require("../utils/middleware.js");
const Company=require("../models/company.js");
const Application=require("../models/application.js");

//job index
router.get("/",isLoggedIn,wrapAsync(async(req,res)=>{
    let jobs;
    const{location,jobType,categories}=req.query;
    const filter = {};
        if (location) {
            try {
                const parsedLocation = JSON.parse(location);
                if (parsedLocation.city) filter["location.city"] = parsedLocation.city;
                if (parsedLocation.country) filter["location.country"] = parsedLocation.country;
            } catch (err) {
                console.warn("Invalid location format");
            }
        }
        if (categories) filter["category"]=categories;
        if (jobType) filter["jobType"]=jobType;
    if(filter){
        jobs=await Job.find(filter);
    }else{
        jobs=await Job.find({});
    }
    const ownerIds = jobs.map(e => e.owner);
    console.log(ownerIds);
    // Step 2: Fetch all matching companies in one query
    const companies = await Company.find({ companyId: { $in: ownerIds } });
    console.log(companies,"com");
     const companyMap = new Map(companies.map(c => [c.companyId.toString(), c]));
    const enrichedjobs = jobs.map(i => ({
         ...i.toObject(),
        company: companyMap.get(i.owner.toString())
    }));
    console.log("hello");

    res.render("student/jobindex.ejs",{enrichedjobs});
}));

//job details
router.get("/:id",isLoggedIn,saveredirectUrl,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let job=await Job.findById(id);
    let companyid = job.owner;
    let company =await Company.find({companyId:companyid});
    let applied=await Application.find({userId:req.user._id,jobId:id});
    let path=res.locals.redirect;
    res.render("student/jobshow.ejs",{job,company,applied,path});
}));


//job apply
router.post("/:id",isLoggedIn,isapplied,wrapAsync(async(req,res)=>{
    let job=await Job.findById(req.params.id)
    let application=new Application({
        jobId: req.params.id,
        userId: req.user._id,
        companyId:job.owner
    });
    let applied=await application.save();
    if(applied){
        req.flash("success","you applied successfully");
        res.redirect("/student/job");
    }
}));


module.exports=router;
