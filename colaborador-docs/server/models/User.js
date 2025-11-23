const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, default: null, unique: true, sparse: true },
    passwordHash: { type: String, default: null },
    status: { type: String, enum: ['online', 'offline', 'idle', 'typing'], default: 'offline' },
    avatarUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = model('User', UserSchema);