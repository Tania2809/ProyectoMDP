# MongoDB — esquema y ejemplos (rápido)

Este documento muestra el esquema de las colecciones principales usadas por el backend (`server/`) y ejemplos de uso con Mongoose y consultas útiles.

Collections y campos principales

- `users` (colección `users`)
  - `_id` : ObjectId
  - `name` : string (required)
  - `email` : string (unique, opcional)
  - `passwordHash` : string (hash bcrypt)
  - `status` : string enum ('online','offline','idle','typing')
  - `avatarUrl` : string (opcional)
  - `createdAt`, `updatedAt` : timestamps (mongoose)

- `documents` (colección `documents`)
  - `_id` : ObjectId
  - `name` : string (required)
  - `type` : string (p.ej. 'PDF','Word','Excel')
  - `content` : string (texto / markdown)
  - `authorId` : ObjectId (referencia a `users`)
  - `metadata` : mixed / JSON (tags, version, etc.)
  - `createdAt`, `updatedAt` : timestamps

Ejemplo de modelos Mongoose (ya incluidos en `server/models`)

server/models/User.js
```js
const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, default: null, unique: true, sparse: true },
  passwordHash: { type: String, default: null },
  status: { type: String, enum: ['online','offline','idle','typing'], default: 'offline' },
  avatarUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = model('User', UserSchema);
```

server/models/Document.js
```js
const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, default: '' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('Document', DocumentSchema);
```

Conexión (ejemplo)
```js
// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/colaboradordb';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => { console.error('Error conectando MongoDB', err); process.exit(1); });
```

Índices recomendados
- `users.email` : unique index (ya definido con `unique: true`).
- `documents.createdAt` : index para ordenar rápido; `documents.type` si buscas por tipo.

Operaciones comunes (Mongoose)

- Listar documentos:
```js
const docs = await Document.find().sort({ createdAt: -1 });
```

- Obtener documento con autor poblado:
```js
const doc = await Document.findById(id).populate('authorId', 'name email');
```

- Actualizar contenido (con timestamp automático):
```js
const updated = await Document.findByIdAndUpdate(id, { content: newContent }, { new: true });
```

- Buscar documentos por tag (si guardas tags en metadata.tags):
```js
const docs = await Document.find({ 'metadata.tags': 'dashboard' });
```

Autenticación y usuarios
- En `server/seed.js` se crean usuarios con `passwordHash` (bcrypt). Para obtener un token JWT, realiza POST a `/auth/login` con `{ email, password }`.

Ejemplo curl: obtener token
```sh
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@ejemplo.com","password":"password123"}'
```

Uso del token (ejemplo crear documento protegido)
```sh
curl -X POST http://localhost:4000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -d '{"name":"Nuevo","type":"Word","content":"Hola"}'
```

Seed y datos de ejemplo
- Ejecuta `npm run seed` dentro de `server/` para poblar datos iniciales (usuarios y documentos). El seed muestra las credenciales en la consola.

Consejos de producción
- No commits `.env` con `MONGO_URI` ni `JWT_SECRET`.
- Usar un usuario/rol de base de datos con permisos mínimos.
- Considerar backups y TTL para logs o notificaciones.

Si quieres, genero un `mongo-init` con migraciones (scripts de creación/índices) y un `README` con pasos para desplegar en Atlas. También puedo crear una colección `revisions` para versionado de documentos si se necesita historial.
