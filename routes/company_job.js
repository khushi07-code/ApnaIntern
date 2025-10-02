const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Job=require("../models/job.js");
const { optionjob, isLoggedIn } = require("../utils/middleware.js");
const Application=require("../models/application.js");
const User=require("../models/user.js");

router.get("/new",isLoggedIn,optionjob,(req,res)=>{
    res.render("company/job_new.ejs");
});

// jobindex
router.get("/",isLoggedIn,wrapAsync(async(req,res)=>{
    let jobs = await Job.find({ owner: req.user._id });
    res.render("company/job_index.ejs",{jobs});
}));

//job-show
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const job=await Job.findById(id);
    res.render("company/job_show.ejs",{job});
}));


//edit-job
router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const job=await Job.findById(id);
    res.render("company/job_edit.ejs",{job});
}));
// update
router.put("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    await Job.findByIdAndUpdate(id,{...req.body.list});
    req.flash("success","updated!");
    res.redirect(`/company/job/${id}`);
}));

//delete
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Job.findByIdAndDelete(id);
    req.flash("success","deleted!");
    res.redirect("/company/job");
}));

//application 
router.get("/application/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const application=await Application.find({jobId:id});
    console.log(application,"ok");
    const applieds = await Promise.all(
        application.map(async (e) => {
            return await User.findById(e.userId);
        })
    );
    console.log(applieds,"hello");
    res.render("company/application.ejs",{application ,applieds});
}));

module.exports=router;