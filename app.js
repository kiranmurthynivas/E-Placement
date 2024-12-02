const express = require("express");
const app = express();
const Notice = require("./models/notice.js");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const twilio = require('twilio');
const { parsePhoneNumber } = require("libphonenumber-js");
const wrapAsync  = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/e-placement";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
  await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/home", wrapAsync( async (req, res) => {
    res.render("includes/home.ejs");
}));

app.get("/about", wrapAsync( async (req, res) => {
    res.render("includes/about.ejs");
}));

app.get("/notice",wrapAsync(async (req, res) => {
    let allNotices = await Notice.find({}).sort({ created_at: -1 }); 
    res.render("notices/index.ejs", { allNotices });
}));

app.delete("/notice/:id",wrapAsync ( async (req,res) =>{
    let {id} = req.params;
    let deletedNotice = await Notice.findByIdAndDelete(id);
    console.log(deletedNotice);
    res.redirect("/notice");
}));

app.get("/notice/new", wrapAsync(async (req, res) => {
    res.render("notices/new.ejs");
}));

function formatPhoneNumber(number) {
    try {
        const phoneNumber = parsePhoneNumber(number, "IN"); // Replace "IN" with your country code
        return phoneNumber.isValid() ? phoneNumber.number : null; // Return the E.164 format if valid
    } catch (err) {
        console.error("Invalid phone number format:", number, err.message);
        return null;
    }
}

app.post("/notice", wrapAsync(async (req, res) => {
    const newNotice = new Notice(req.body.notice);

    try {
        // Save the new notice
        await newNotice.save();

        const students = await Student.find({});
        const validRecipients = students
            .map(student => formatPhoneNumber(student.mobileNumber))
            .filter(number => number !== null);

        console.log("Valid Recipients:", validRecipients);

        // Send SMS notifications to valid recipients
        for (let recipient of validRecipients) {
            await twilioClient.messages.create({
                body: `A new notice has been created: ${newNotice.title}`,
                from: '+17753631471', // Your valid Twilio phone number
                to: recipient,
            });
        }

        console.log("Notifications sent successfully.");
    } catch (err) {
        console.error("Error creating notice or sending notifications:", err);
    }

    // Redirect after completing the operation
    res.redirect("/notice");
}));

app.get("/resource/workshops", wrapAsync( async (req,res) => {
    res.render("workshops/recorded.ejs");
}));

app.get("/resource/roadmaps",wrapAsync( async (req,res) => {
    res.render("roadmaps/roadmaps.ejs");
}));

app.get("/resource/workshops/new",wrapAsync( async (req,res) => {
    res.render("workshops/newVideo.ejs");
}));

app.all("*", (req,res,next) => {
    next(new ExpressError (404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{ err });
});

app.listen(3000, () =>{
    console.log("server listning to port 3000");
});
