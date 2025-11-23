require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- MODELOS DE MONGOOSE ---

const userSchema = new mongoose.Schema({
    name: String,
    status: { type: String, default: 'offline' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const documentSchema = new mongoose.Schema({
    title: String,
    content: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
const Document = mongoose.model('Document', documentSchema);


// --- CONFIGURACIÓN DE EXPRESS ---

const app = express();
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite leer el body de las peticiones en formato JSON

const PORT = process.env.PORT || 3000;

// --- RUTAS DE LA API ---

// Obtener todos los usuarios
app.get('/api/users', async(req, res) => {
    const users = await User.find();
    res.json(users);
});

// Obtener todos los documentos
app.get('/api/documents', async(req, res) => {
    // Usamos .populate para traer la información del autor en lugar de solo su ID
    const documents = await Document.find().populate('authorId', 'name');
    res.json(documents);
});

// Crear un nuevo documento
app.post('/api/documents', async(req, res) => {
    // En una app real, el authorId vendría del usuario autenticado
    const firstUser = await User.findOne(); // Para este ejemplo, asignamos al primer usuario

    const newDocument = new Document({
        ...req.body,
        authorId: firstUser._id
    });
    await newDocument.save();
    res.status(201).json(newDocument);
});

// --- INICIAR SERVIDOR Y CONEXIÓN A DB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => console.error('Error al conectar a MongoDB:', err));