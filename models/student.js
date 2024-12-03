const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const studentSchema = new Schema({
    usn: { type: String, required: true },
    branch: { type: String, required: true },
    mobileNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`,
        },
    },
    email: {
        type: String,
        required: true,
    },
    role: { type: String, default: 'student' }, // Add role field for clarity
});

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);