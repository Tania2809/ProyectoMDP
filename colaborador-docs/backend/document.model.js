const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: String,
    content: String,
    type: String,
    author: String,
    sharedWith: [String]
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;