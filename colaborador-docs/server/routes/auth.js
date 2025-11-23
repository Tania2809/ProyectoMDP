const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secret = process.env.JWT_SECRET || 'dev_secret';

router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash || '');
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const payload = { id: user._id, name: user.name, email: user.email };
        const token = jwt.sign(payload, secret, { expiresIn: '12h' });
        res.json({ token, user: payload });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;