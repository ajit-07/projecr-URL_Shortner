const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    urlCode: { type: String, trim: true, required: true, unique: true,lowercase:true},
    longUrl: { type: String, trim: true, required: true },
    shortUrl: { type: String, trim: true, required: true, unique: true }
}, { timestamps: true })

module.exports = mongoose.model('Url', urlSchema);