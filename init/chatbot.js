const mongoose = require("mongoose");
const Opportunity = require("../models/oppotunity.js");
const FAQ = require("../models/faq.js");

if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
async function main(){
    console.log(process.env.MONGODBURL);
    await mongoose.connect(process.env.MONGODBURL);
}
main().catch((e)=>{
    console.log(e);
})
const seedOpportunities = [
  {
    title: "Frontend Developer Intern",
    type: "internship",
    location: "Remote",
    company: "TechNova",
    description: "Work with React and improve UI/UX."
  },
  {
    title: "Backend Developer Intern",
    type: "internship",
    location: "Bangalore",
    company: "CodeCraft",
    description: "Develop REST APIs using Node.js and MongoDB."
  },
  {
    title: "Software Engineer",
    type: "job",
    location: "Mumbai",
    company: "InnoTech",
    description: "Full-time role focusing on scalable backend systems."
  },
  {
    title: "Data Analyst",
    type: "job",
    location: "Remote",
    company: "DataWiz",
    description: "Analyze business data and generate reports."
  }
];

const seedFAQs = [
  {
    question: "How do I apply for an internship?",
    answer: "To apply for internships, go to the 'Opportunities' page, select 'Internships', and click on the apply button next to the position you're interested in."
  },
  {
    question: "What documents are required for job applications?",
    answer: "You typically need a resume, cover letter, and sometimes a portfolio depending on the role."
  },
  {
    question: "Can I work remotely?",
    answer: "Yes, many of our listed opportunities support remote work. Check the job/internship description for location details."
  },
  {
    question: "Is there a stipend for internships?",
    answer: "Some internships offer stipends while others may not. Details are usually mentioned in the internship listing."
  }
];

async function seedDB() {
  await Opportunity.deleteMany({});
  await FAQ.deleteMany({});

  await Opportunity.insertMany(seedOpportunities);
  await FAQ.insertMany(seedFAQs);

  console.log("Database seeded successfully ✅");
  mongoose.connection.close();
}

seedDB();
