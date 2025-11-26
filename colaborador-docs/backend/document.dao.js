const Document = require('../models/document.model');

/**
 * Clase DocumentDAO para gestionar el acceso a datos de los documentos.
 * Encapsula todas las operaciones de la base de datos.
 */
class DocumentDAO {
    /**
     * Obtiene todos los documentos, ordenados por fecha de creación descendente.
     * @returns {Promise<Document[]>}
     */
    async findAll() {
        return Document.find().sort({ createdAt: -1 }).lean().exec();
    }

    /**
     * Crea un nuevo documento.
     * @param {object} documentData - Los datos del documento a crear.
     * @returns {Promise<Document>}
     */
    async create(documentData) {
        const document = new Document(documentData);
        return document.save();
    }

    /**
     * Actualiza un documento existente por su ID.
     * @param {string} id - El ID del documento.
     * @param {object} updateData - Los datos para actualizar.
     * @returns {Promise<Document|null>}
     */
    async update(id, updateData) {
        return Document.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    /**
     * Elimina un documento por su ID.
     * @param {string} id - El ID del documento a eliminar.
     * @returns {Promise<Document|null>}
     */
    async delete(id) {
        return Document.findByIdAndDelete(id).exec();
    }

    /**
     * Busca un documento por su ID.
     * @param {string} id - El ID del documento.
     * @returns {Promise<Document|null>}
     */
    async findById(id) {
        return Document.findById(id).exec();
    }
}

module.exports = new DocumentDAO();