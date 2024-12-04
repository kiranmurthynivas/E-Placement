const mongoose = require("mongoose");
const initData = require("./data.js");
const Mentor = require("../models/mentor.js"); // Import Student model

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

const seedMentor = async () => {
    try {
        // Create a new mentor object and set the 'username' to 'name' value
        const mentor = new Mentor({
            username: "Anitha T N",  // This will be used as 'name' in passport-local-mongoose
            role: "mentor"
        });

        // Register the mentor with the password
        const registeredMentor = await Mentor.register(mentor, "anitha123");

        console.log("Mentor registered successfully:", registeredMentor);
        mongoose.connection.close(); // Close the connection after insertion
    } catch (error) {
        console.error("Error inserting mentor:", error);
        mongoose.connection.close();
    }
};

// Call the function to insert the data
seedMentor();

