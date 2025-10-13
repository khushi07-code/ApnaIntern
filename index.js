if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejsMate = require("ejs-mate");
const path=require("path");
const MongoStore = require('connect-mongo');
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


const MongoUrl=process.env.MONGODBURL;
async function main(){
    await mongoose.connect(MongoUrl);
}
main().then((res)=>{
    console.log(res);
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});
console.log(MongoUrl);
const store=MongoStore.create({
  mongoUrl: MongoUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter:24*3600
})

const sessionOption={ 
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,  //ms*s*min*h*days
        maxAge:1000*60*60*24*3,
    }
};


const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// ✅ Enable CORS for frontend on port 8080
const io = new Server(server);




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
    const internships=await Internship.find({}).limit(3);
    const jobs=await Job.find({}).limit(3);
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


io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userMessage", (msg) => {
    const reply = generateBotReply(msg);
    socket.emit("botReply", reply);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

function generateBotReply(msg) {
    msg = msg.toLowerCase();

    // Mock job/internship data
    const opportunities = [
        { type: "internship", title: "Frontend Developer Intern", location: "Remote" },
        { type: "internship", title: "Data Analyst Intern", location: "New York" },
        { type: "job", title: "Software Engineer", location: "San Francisco" },
        { type: "job", title: "Product Manager", location: "Remote" }
    ];

    if (msg.includes("internship")) {
        const internships = opportunities.filter(op => op.type === "internship");
        let reply = "Here are some internship recommendations:\n";
        internships.forEach((op, i) => {
            reply += `${i + 1}. ${op.title} - ${op.location}\n`;
        });
        return reply;
    }

    if (msg.includes("job")) {
        const jobs = opportunities.filter(op => op.type === "job");
        let reply = "Here are some job recommendations:\n";
        jobs.forEach((op, i) => {
            reply += `${i + 1}. ${op.title} - ${op.location}\n`;
        });
        return reply;
    }

    if (msg.includes("hello") || msg.includes("hi")) {
        return "Hi there! How can I help you today?";
    }

    return "I'm still learning. Can you rephrase that?";
}


server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});