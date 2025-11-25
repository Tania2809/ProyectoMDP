// 1. Cargar variables de entorno
require('dotenv').config();

// 2. Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Inicializar la aplicación y definir el puerto
const app = express();
const PORT = 3000;

// 4. Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 5. Middlewares
app.use(cors());
app.use(express.json());

// 6. Definir el Schema y Modelo de Mongoose
const documentSchema = new mongoose.Schema({
    title: String,
    content: String,
    type: String, // Añadimos el tipo de documento
    author: String,
    sharedWith: [String]
}, { timestamps: true }); // timestamps añade automáticamente createdAt y updatedAt

const Document = mongoose.model('Document', documentSchema);

// 7. Definir las rutas de la API
const router = express.Router();

// [READ] GET /api/documents -> Obtener todos los documentos
router.get('/documents', async(req, res) => {
    try {
        const documents = await Document.find().sort({ createdAt: -1 }); // Ordenar por más reciente
        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// [CREATE] POST /api/documents -> Crear un nuevo documento
router.post('/documents', async(req, res) => {
    const { title, content, author, type } = req.body; // Obtenemos el tipo de la petición
    const document = new Document({ title, content, author, type });

    try {
        const newDocument = await document.save();
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// [UPDATE] PUT /api/documents/:id -> Actualizar un documento
router.put('/documents/:id', async(req, res) => {
    try {
        // Solución: Extraemos todos los campos relevantes del cuerpo de la petición.
        const { title, content, author, type, sharedWith } = req.body;
        const updateData = { title, content, author, type, sharedWith };

        // Usamos los datos extraídos para actualizar el documento.
        // { new: true } asegura que la respuesta devuelva el documento ya actualizado.
        const updatedDocument = await Document.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedDocument) return res.status(404).json({ message: 'Documento no encontrado' });
        res.json(updatedDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// [DELETE] DELETE /api/documents/:id -> Eliminar un documento
router.delete('/documents/:id', async(req, res) => {
    try {
        const deletedDocument = await Document.findByIdAndDelete(req.params.id);
        if (!deletedDocument) return res.status(404).json({ message: 'Documento no encontrado' });
        res.json({ message: 'Documento eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Prefijo /api para todas las rutas definidas en el router
app.use('/api', router);

// 8. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
});