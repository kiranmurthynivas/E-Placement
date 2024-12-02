const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workshopSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    image: {
        url: String,
        filename:  String,
    },
});

const Workshop= mongoose.model("Workshop", workshopSchema);
module.exports = Workshop;