const Application=require("../models/application.js");

module.exports.optionintern=(req,res,next)=>{
    req.session.listingtype="internship";
    next();
}
module.exports.optionjob=(req,res,next)=>{
    req.session.listingtype="job";
    next();
}
module.exports.optionusertype=(req,res,next)=>{
    req.session.usertype=req.user.usertype;
    next();
};
module.exports.isLoggedIn=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing.");
        res.redirect("/login");
    }else{
        next();
    }
};

module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirect=req.session.redirectUrl;
    }
    next();
};

module.exports.isapplied=async(req,res,next)=>{
    let applied=await Application.find({userId:req.user._id,$or:[{jobId:req.params.id},{internshipId:req.params.id}]});
    if(applied.length==0){
        next();
    }
    else{
        req.flash("success","You already applied!");         
        res.redirect(req.originalUrl);
    }
};



module.exports.savedbackpath=(req,res)=>{
    req.session.redirectUrl=req.originalUrl;
};