require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const documentsRouter = require('./routes/documents');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/documents', documentsRouter);
app.use('/api/users', usersRouter);
app.use('/auth', authRouter);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB conectado');
        app.listen(PORT, () => console.log(`API running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Error conectando MongoDB', err);
        process.exit(1);
    });