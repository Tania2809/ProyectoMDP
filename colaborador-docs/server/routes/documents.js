const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async(req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async(req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    try {
        const doc = new Document(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authenticateToken, async(req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

router.get('/', async(req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async(req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const doc = new Document(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async(req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;