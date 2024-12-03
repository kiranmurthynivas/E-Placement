if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const Notice = require("./models/notice.js");
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const twilio = require('twilio');
const { parsePhoneNumber } = require("libphonenumber-js");
const wrapAsync  = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Workshop = require("./models/workshop.js");
const Student = require("./models/student.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });


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

const twilioClient = twilio("AC094baef554ff21c5fad09a7cbefd4785", "23921aa21cc895f7eaca7176bf6cec6c");

function formatPhoneNumber(number) {
    try {
        console.log("Original phone number:", number); // Log the original number

        if (!number.startsWith("+91")) {
            number = "+91" + number; // Add +91 if it doesn't exist
        }

        console.log("Formatted phone number:", number); // Log the formatted number

        // Ensure number is in E.164 format and valid
        const phoneNumberRegex = /^\+91\d{10}$/;
        return phoneNumberRegex.test(number) ? number : null;
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

        // Fetch all students
        const students = await Student.find({});
        console.log("Fetched Students:", students);

        // Map the students to get their formatted phone numbers
        const validRecipients = students
            .map(student => formatPhoneNumber(student.mobileNumber))  // Format each phone number
            .filter(number => number !== null);  // Filter out invalid numbers

        console.log("Valid Recipients:", validRecipients);

        // Send SMS notifications to valid recipients
        for (let recipient of validRecipients) {
            await twilioClient.messages.create({
                body: `A new notice has been created: ${newNotice.title}`,
                from: "+17753631471", // Your valid Twilio phone number
                to: recipient,
            });
        }

        console.log("Notifications sent successfully.");
    } catch (err) {
        console.error("Error creating notice or sending notifications:", err);
    }

    // Redirect to notices page after operation
    res.redirect("/notice");
}));


app.get("/resource/roadmaps",wrapAsync( async (req,res) => {
    res.render("roadmaps/roadmaps.ejs");
}));

app.get("/resource/workshops", wrapAsync(async (req, res) => {
    const allWorkshops = await Workshop.find({}).sort({ created_at: -1 }); // Fetch all workshops
    res.render("workshops/recorded.ejs", { allWorkshops }); // Pass to the EJS template
}));


app.get("/resource/workshops/new", wrapAsync(async (req, res) => {
    res.render("workshops/newVideo.ejs");
}));

app.post("/resource/workshops", upload.single("thumbnail"), wrapAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const { path: url, filename } = req.file; // Get the file URL and filename from Cloudinary

    const newWorkshop = new Workshop(req.body.notice);
    newWorkshop.image = { url, filename }; // Save the image URL and filename
    newWorkshop.owner = req.user ? req.user._id : null; // Save the workshop owner if available

    try {
        // Save the new workshop
        await newWorkshop.save();

        // Fetch all students
        const students = await Student.find({});
        console.log("Fetched Students:", students);

        // Map the students to get their formatted phone numbers
        const validRecipients = students
            .map(student => formatPhoneNumber(student.mobileNumber))  // Format each phone number
            .filter(number => number !== null);  // Filter out invalid numbers

        console.log("Valid Recipients:", validRecipients);

        // Send SMS notifications to valid recipients
        for (let recipient of validRecipients) {
            await twilioClient.messages.create({
                body: `A new video has been uploaded: ${newWorkshop.title}. Check it out on our platform!`,
                from: "+17753631471", // Your valid Twilio phone number
                to: recipient,
            });
        }

        console.log("SMS notifications sent successfully.");
    } catch (err) {
        console.error("Error uploading workshop or sending notifications:", err);
    }

    res.redirect("/resource/workshops");
}));


app.delete("/resource/workshops/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Workshop.findByIdAndDelete(id); // Deletes the workshop from the database
        res.redirect("/resource/workshops"); // Redirect back to the workshops page
    } catch (err) {
        console.error("Error deleting workshop:", err);
        res.status(500).send("An error occurred while deleting the workshop.");
    }
});

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
