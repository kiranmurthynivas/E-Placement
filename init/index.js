const mongoose = require("mongoose");
const initData = require("./data.js");
const Notice = require("../models/notice.js");
const Mentor = require("../models/mentor.js");  // Import Mentor model

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

const initDb = async () => {
    // Clear existing data
    // await Notice.deleteMany({});
    await Mentor.deleteMany({});  // Clear Mentor collection too

    // Insert the sample notices
    // await Notice.insertMany(initData.data);
    // console.log("Notices data was initialized");

    // Create a mentor
    const mentor = new Mentor({
        name: "Anitha T N",
        password: "anitha123",  // Ideally, you should hash this password before saving
    });

    // Save the mentor
    await mentor.save();
    console.log("Mentor data was initialized");
};

initDb();
