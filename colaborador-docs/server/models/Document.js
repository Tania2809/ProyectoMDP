const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, default: '' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('Document', DocumentSchema);