const mongoose = require("mongoose");
const initData = require("./data.js");
const Student = require("../models/student.js"); // Import Student model

const MONGO_URL = "mongodb://127.0.0.1:27017/e-placement";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDb = async () => {
    try {
        // Clear existing Student data
        await Student.deleteMany({});
        console.log("Cleared Student collection");

        // Insert sample students
        await Student.insertMany(initData.data); // Insert all students from initData
        console.log("Student data was initialized");
    } catch (error) {
        console.error("Error initializing the database:", error);
    }
};

initDb();
