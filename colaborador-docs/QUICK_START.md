# 🚀 Guía de Configuración y Uso Rápido

## ✅ Verificar que todo está funcionando

### 1. Compilación sin errores
```bash
ng serve
# Debe compilar sin errores en los siguientes archivos:
# ✅ chat.component.ts
# ✅ user-list.component.ts
# ✅ notification.component.ts
# ✅ collaboration-hub.component.ts
# ✅ mock-data.service.ts
```

### 2. Imports necesarios
Asegúrate de que tu componente raíz tenga:
```typescript
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
```

---

## 📦 Instalación (3 pasos)

### Paso 1: Verificar dependencias
```json
{
  "dependencies": {
    "@angular/common": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "rxjs": "^7.0.0"
  }
}
```
Si faltan, instala: `npm install`

### Paso 2: Importar en tu componente principal
```typescript
import { CollaborationHubComponent } from './shared/components/collaboration-hub/collaboration-hub.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CollaborationHubComponent],
  template: '<app-collaboration-hub></app-collaboration-hub>'
})
export class AppComponent {}
```

### Paso 3: ¡Listo! 🎉
Tu app ya tiene chat, usuarios y notificaciones funcionales.

---

## 🎯 Uso Rápido

### Opción 1: Integración Completa (Recomendado)
```typescript
// app.component.ts
import { CollaborationHubComponent } from './shared/components/collaboration-hub/collaboration-hub.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CollaborationHubComponent],
  template: `<app-collaboration-hub></app-collaboration-hub>`
})
export class AppComponent {}
```

### Opción 2: Componentes Individuales
```typescript
// my-page.component.ts
import { ChatComponent } from './shared/components/chat/chat.component';
import { UserListComponent } from './shared/components/user-list/user-list.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [CommonModule, ChatComponent, UserListComponent, NotificationComponent],
  template: `
    <app-notifications></app-notifications>
    <div style="display: flex; gap: 20px;">
      <app-user-list></app-user-list>
      <app-chat></app-chat>
    </div>
  `
})
export class MyPageComponent {}
```

### Opción 3: Con datos personalizados
```typescript
// my-component.component.ts
import { MockDataService } from './services/mock-data.service';

@Component({
  selector: 'app-my-component',
  template: `
    <button (click)="loadData()">Cargar Datos</button>
  `
})
export class MyComponent {
  constructor(private mockData: MockDataService) {}

  loadData() {
    this.mockData.getUsers().subscribe(users => {
      console.log('Usuarios disponibles:', users);
    });
  }
}
```

---

## 🧪 Pruebas Funcionales

### Test 1: Chat funciona
```
✓ Puedo escribir mensajes
✓ Los mensajes aparecen en el historial
✓ Veo timestamps en los mensajes
✓ Puedo seleccionar diferentes usuarios
✓ Puedo crear un nuevo usuario
```

### Test 2: Lista de usuarios funciona
```
✓ Veo todos los usuarios disponibles
✓ Los avatares muestran iniciales
✓ Los indicadores de estado funcionan
✓ Puedo buscar usuarios
✓ Se muestra el contador de en línea
```

### Test 3: Notificaciones funcionan
```
✓ Aparecen en la esquina inferior derecha
✓ Se cierran automáticamente en 5 segundos
✓ Puedo cerrar manualmente
✓ Tienen diferentes colores por tipo
✓ Los íconos son descriptivos
```

### Test 4: Integración funciona
```
✓ Los componentes están integrados
✓ Las notificaciones se disparan al unirse usuarios
✓ El layout es responsivo
✓ Funciona sin base de datos
✓ Puedo restaurar datos
```

---

## 🎨 Personalización

### Cambiar colores
```typescript
// En cualquier componente, modifica los estilos:
// Busca el gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
// Reemplaza con tus colores
```

### Cambiar tiempo de auto-cierre
```typescript
// En notification.component.ts, línea ~42:
private readonly AUTO_DISMISS_MS = 5000;  // 5 segundos
// Cambia a: 3000, 7000, etc.
```

### Agregar más usuarios de prueba
```typescript
// En mock-data.service.ts, método initializeStatusUpdates():
// Añade más usuarios con createUser()
```

### Cambiar idioma
```typescript
// Busca todas las cadenas de texto en español
// Reemplaza con tu idioma
// Ejemplo: "Enviar" → "Send"
```

---

## 🐛 Solución de Problemas

### Problema: "Cannot find module"
**Solución**: Verifica que los imports están correctos
```typescript
// ❌ Incorrecto
import { ChatComponent } from '../../shared/components/chat';

// ✅ Correcto
import { ChatComponent } from '../../shared/components/chat/chat.component';
```

### Problema: Componentes no aparecen
**Solución**: Verifica que están importados y son standalone
```typescript
@Component({
  selector: 'app-chat',
  standalone: true,  // ← Importante
  imports: [CommonModule, FormsModule],  // ← Necesario
  // ...
})
```

### Problema: ngModel no funciona
**Solución**: Importa FormsModule
```typescript
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],  // ← Añade esto
})
```

### Problema: Notificaciones no aparecen
**Solución**: Asegúrate de que NotificationComponent está en el árbol
```typescript
// En app.component.ts (componente raíz):
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  imports: [NotificationComponent, OtrosComponentes],
})
```

### Problema: Estilos no se ven
**Solución**: Borra caché y recarga
```bash
ng serve --poll=2000
# Luego recarga el navegador
```

---

## 📊 Estructura de Datos

### Usuario
```typescript
interface User {
  id: number;
  name: string;
  status?: 'online' | 'idle' | 'offline' | 'typing';
}
```

### Mensaje
```typescript
interface Message {
  id: number;
  user: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
  userId?: number;
}
```

### Notificación
```typescript
interface Toast {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}
```

### Documento
```typescript
interface Document {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: string[];
}
```

---

## 🔌 API del MockDataService

### Métodos de Usuarios
```typescript
// Obtener lista de usuarios
mockData.getUsers(): Observable<User[]>

// Obtener usuario específico
mockData.getUserById(id: number): Observable<User | undefined>

// Actualizar estado de usuario
mockData.updateUserStatus(userId: number, status: UserStatus): void
```

### Métodos de Documentos
```typescript
// Obtener todos los documentos
mockData.getDocuments(): Observable<Document[]>

// Documentos de un usuario
mockData.getDocumentsForUser(userName: string): Observable<Document[]>

// Documento específico
mockData.getDocumentById(id: number): Observable<Document | undefined>

// Crear documento
mockData.createDocument(title, content, author): Observable<Document>

// Actualizar documento
mockData.updateDocument(id, updates): Observable<Document | null>

// Compartir documento
mockData.shareDocument(docId, userNames): Observable<Document | null>

// Eliminar documento
mockData.deleteDocument(id): Observable<boolean>

// Restaurar datos iniciales
mockData.resetMockData(): void
```

---

## 📈 Escalabilidad

### Para Pequeño Proyecto (< 10 usuarios)
✅ Usa los componentes tal como están
✅ Mock data es suficiente
✅ No necesitas cambios

### Para Proyecto Mediano (10-100 usuarios)
⚠️ Considera agregar paginación
⚠️ Limita el historial de mensajes
⚠️ Usa virtual scrolling para listas
⚠️ Sigue usando mock data para testing

### Para Proyecto Grande (> 100 usuarios)
❌ Necesitarás backend real
❌ Implementa WebSocket para tiempo real
❌ Agrega base de datos
❌ Considera usar NgRx para estado
❌ Implementa cache estratégico

---

## 🚀 Próximos Pasos

1. **Conectar con Backend**
   - Reemplaza MockDataService con llamadas HTTP
   - Implementa WebSocket para chat en tiempo real
   - Agrega autenticación

2. **Mejorar UX**
   - Emojis en mensajes
   - Reacciones a mensajes
   - Editar mensajes
   - Eliminar mensajes

3. **Funcionalidades Avanzadas**
   - Compartir archivos
   - Videollamadas
   - Canales temáticos
   - Búsqueda de historial
   - Mencionas @usuario

4. **Testing**
   - Unit tests con Jasmine
   - E2E tests con Cypress
   - Test coverage > 80%

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisa la documentación en `COLLABORATION_HUB_README.md`
2. Verifica los ejemplos en `USAGE_EXAMPLES.ts`
3. Consulta los resumen de mejoras en `IMPROVEMENTS_SUMMARY.md`
4. Inspecciona el código fuente (bien comentado)

---

## ✨ Características Destacadas

✅ **Sin Base de Datos**: Funciona completamente en memoria
✅ **Responsive**: Se adapta a cualquier tamaño de pantalla
✅ **Accesible**: WCAG compliant
✅ **Moderno**: Diseño actual y profesional
✅ **Fácil de Usar**: API simple e intuitiva
✅ **Extensible**: Fácil de personalizar
✅ **Documentado**: Código comentado y guías completas
✅ **Rendimiento**: Optimizado para flujo suave
✅ **TypeScript**: Tipos completos
✅ **Standalone**: Sin dependencias de NgModule

---

**¡Disfruta tu centro de colaboración! 🎉**
