const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const mentorSchema = new Schema({
    role: { type: String, default: 'mentor' },
});

mentorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Mentor", mentorSchema);