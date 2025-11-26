const DocumentDAO = require('../daos/document.dao');

// [READ] Obtener todos los documentos
exports.getAllDocuments = async(req, res) => {
    try {
        const documents = await DocumentDAO.findAll();
        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// [CREATE] Crear un nuevo documento
exports.createDocument = async(req, res) => {
    try {
        const newDocument = await DocumentDAO.create(req.body);
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// [UPDATE] Actualizar un documento
exports.updateDocument = async(req, res) => {
    try {
        const updatedDocument = await DocumentDAO.update(req.params.id, req.body);
        if (!updatedDocument) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.json(updatedDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// [DELETE] Eliminar un documento
exports.deleteDocument = async(req, res) => {
    try {
        const deletedDocument = await DocumentDAO.delete(req.params.id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.json({ message: 'Documento eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// (Opcional pero recomendado) GET /api/documents/:id
exports.getDocumentById = async(req, res) => {
    // ... Lógica similar usando DocumentDAO.findById(req.params.id)
};