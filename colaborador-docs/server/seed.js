require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/colaboradordb';

async function seed() {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a Mongo para seed');

    await Document.deleteMany({});
    await User.deleteMany({});

    const p1 = await bcrypt.hash('password123', 10);
    const p2 = await bcrypt.hash('secret456', 10);
    const u1 = await User.create({ name: 'Ana', email: 'ana@ejemplo.com', status: 'online', passwordHash: p1 });
    const u2 = await User.create({ name: 'Luis', email: 'luis@ejemplo.com', status: 'offline', passwordHash: p2 });

    await Document.create({ name: 'Reporte CD', type: 'PDF', content: '# CD\n## Dashboard\nContenido de ejemplo', authorId: u1._id });
    await Document.create({ name: 'Documentación Técnica', type: 'Word', content: '## Introducción\nContenido técnico', authorId: u2._id });

    console.log('Seed completado');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
const bcrypt = require('bcryptjs');