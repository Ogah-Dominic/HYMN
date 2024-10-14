const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    songTitle: {
        type: String,
        required: true
    },
    serialNumber: {
        type: Number,
        required: true
    },
    words: {
        type: String,
        required: true
    },
   
}, { timestamps: true });


const songModel = mongoose.model('Songs', songSchema);

module.exports = songModel