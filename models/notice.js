const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const noticeSchema = new Schema({
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
});

const Notice = mongoose.model("Notice", noticeSchema);
module.exports = Notice;