if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejsMate = require("ejs-mate");
const path=require("path");
const session=require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const expressError=require("./utils/expressError.js");
const flash=require("connect-flash");
const User = require("./models/user.js");
const Internship = require("./models/internship.js");
const Job = require("./models/job.js");
const methodOverride=require("method-override");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));



async function main(){
    await mongoose.connect(process.env.MONGODBURL);
}
main().then((res)=>{
    console.log(res);
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});


const sessionOption={ 
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,  //ms*s*min*h*days
        maxAge:1000*60*60*24*3,
    }
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const student_route=require("./routes/student.js");
const student_intern_route=require("./routes/student_internship.js");
const student_job_route=require("./routes/student_job.js");
const company_route=require("./routes/company.js");
const company_intern_route=require("./routes/company_internship.js");
const company_job_route=require("./routes/company_job.js");
const user_route=require("./routes/user.js");




app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.isSignup=req.session.isSignup;
    next();
});


app.get("/",async(req,res)=>{
    const internships=await Internship.find({});
    const jobs=await Job.find({});
    res.render("home.ejs",{internships,jobs});
});
//student
app.use("/student",student_route);
app.use("/student/internship",student_intern_route);
app.use("/student/job",student_job_route);

//company
app.use("/company",company_route);
app.use("/company/internship",company_intern_route);
app.use("/company/job",company_job_route);

//signup,login/logout
app.use("/",user_route);
app.use("/signup",(req,res)=>{
    res.render("beforeSignup.ejs");

});
app.all(/.*/,(req,res,next)=>{
    next(new expressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Some error!"}=err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,(req,res)=>{
    console.log("listening..............");
});