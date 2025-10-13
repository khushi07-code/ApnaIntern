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
const FAQ=require("./models/faq.js");
const Opportunity=require("./models/oppotunity.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));

let db;
const MongoUrl=process.env.MONGODBURL;
async function main(){
    await mongoose.connect(process.env.MONGODBURL);
}


main()
  .then(() => {
    console.log("Database Connected!");
  
  })
  .catch(console.error);



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

// GET internships/jobs
app.get("/api/opportunities", async (req, res) => {
  try {
    const type = req.query.type;
    if (!type) return res.status(400).json({ error: "Type query param is required" });

    const data = await Opportunity.find({ type });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET FAQ Answer
app.get("/api/faq", async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || "";
    const result = await FAQ.findOne({ question: { $regex: q, $options: "i" } });

    if (result) {
      res.json(result);
    } else {
      res.json({ answer: "Sorry, I don't have an answer for that." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ WebSocket Chatbot Logic
io.on("connection", (socket) => {
  socket.on("userMessage", async (msg) => {
    const lowerMsg = msg.toLowerCase().trim();
    console.log("💬 User message received:", lowerMsg);

    const jobKeywords = ["job", "jobs", "hiring", "full-time", "career"];
    const internshipKeywords = ["intern", "internship", "training", "trainee", "summer program"];
    const applyKeywords = ["apply", "application", "how to apply", "submit resume"];

    const containsKeyword = (keywords, text) =>
      keywords.some(word => text.includes(word));

    try {
      console.log("🔍 Checking FAQ match...");

      const faq = await FAQ.findOne({
            question: { $regex: lowerMsg, $options: "i" }
      });

      if (faq) {
        console.log("✅ FAQ match found:", faq.question);
        return socket.emit("botReply", faq.answer);
      }

      if (containsKeyword(internshipKeywords, lowerMsg)) {
        console.log("📌 Internship keyword matched");
        const type = "internship";
        const results = await Opportunity.find({ type });

        if (results.length > 0) {
          let reply = `Here are some ${type} opportunities:\n`;
          results.forEach((item, i) => {
            reply += `${i + 1}. ${item.title} - ${item.location}\n`;
          });
          socket.emit("botReply", reply);
        } else {
          socket.emit("botReply", `Sorry, no ${type} opportunities found at the moment.`);
        }

      } else if (containsKeyword(jobKeywords, lowerMsg)) {
        console.log("📌 Job keyword matched");
        const type = "job";
        const results = await Opportunity.find({ type });

        if (results.length > 0) {
          let reply = `Here are some ${type} openings:\n`;
          results.forEach((item, i) => {
            reply += `${i + 1}. ${item.title} - ${item.location}\n`;
          });
          socket.emit("botReply", reply);
        } else {
          socket.emit("botReply", `Sorry, no ${type} openings available right now.`);
        }

      } else if (containsKeyword(applyKeywords, lowerMsg)) {
          socket.emit("botReply", "To apply, click on any opportunity and upload your resume. Make sure your profile is complete!");
      } else {
        console.log("❓ Message didn't match FAQ or keyword");
        socket.emit("botReply", "I'm still learning! You can ask about internships, jobs, or questions like 'How to apply'.");
      }

    } catch (err) {
      console.error("❌ Error in chatbot logic:", err);
      socket.emit("botReply", "Oops! Something went wrong. Please try again later.");
    }
  });
});


server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});