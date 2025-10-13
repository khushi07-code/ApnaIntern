const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Internship=require("../models/internship.js");
const Company=require("../models/company.js");
const { isLoggedIn, isapplied } = require("../utils/middleware.js");
const Application=require("../models/application.js");
const User=require("../models/user.js");

//internship index
router.get("/",isLoggedIn,wrapAsync(async(req,res)=>{
    let internships;
    const{location,duration,categories}=req.query;
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
        if (duration) filter["duration"]=duration;
    if(filter){
        internships = await Internship.find(filter);
    }else{
        internships = await Internship.find({});
    }
    const ownerIds = internships.map(e => e.owner);
    // Step 2: Fetch all matching companies in one query
    const companies = await Company.find({ companyId: { $in: ownerIds } });
    const companyMap = new Map(companies.map(c => [c.companyId.toString(), c]));
    const enrichedInternships = internships.map(i => ({
         ...i.toObject(),
        company: companyMap.get(i.owner.toString())
    }));
    console.log(enrichedInternships);

    res.render("student/internindex.ejs",{enrichedInternships});
}));

// internship details 
router.get("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let internship=await Internship.findById(id);
    let companyid = internship.owner;
    let company=Company.find({companyId:companyid});
    let applied=await Application.find({userId:req.user._id,internshipId:id});
    res.render("student/internshow.ejs",{internship,company,applied});
}));

//internship apply
router.post("/:id",isLoggedIn,isapplied,wrapAsync(async(req,res)=>{
    let intern=await Internship.findById(req.params.id)
    let application=new Application({
            internshipId: req.params.id,
            userId: req.user.id,
            companyId:intern.owner
        });
    let applied=await application.save();
    if(applied){
        req.flash("success","you applied successfully");
        res.redirect("/student/internship");
    }
}));


module.exports=router;