# 🤝 Centro de Colaboración - Documentación

## Descripción General

Se han mejorado significativamente la **vista del chat**, **lista de usuarios**, **notificaciones** y se ha asegurado que funcionen correctamente sin base de datos.

## Componentes Mejorados

### 1. 💬 **Chat Component** (`chat.component.ts`)

#### Mejoras Implementadas:
- **Interfaz Visual Mejorada**: Diseño moderno con gradientes y estilos profesionales
- **Historial de Mensajes**: Visualización clara de mensajes con timestamps
- **Auto-scroll**: Se desplaza automáticamente al último mensaje
- **Soporte Multi-usuario**: Permite seleccionar diferentes usuarios del sistema
- **Crear Nuevo Usuario**: Opción integrada para añadir usuarios dinámicamente
- **Mensajes del Sistema**: Notificaciones especiales de eventos del sistema
- **Diferenciación Visual**: Mensajes propios vs mensajes de otros con colores diferentes
- **Textarea Redimensionable**: Entrada de múltiples líneas para mensajes más largos

#### Características:
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

#### Uso:
```html
<app-chat></app-chat>
```

---

### 2. 👥 **User List Component** (`user-list.component.ts`)

#### Mejoras Implementadas:
- **Avatares Circulares**: Con iniciales del usuario y gradiente de color
- **Indicadores de Estado**: Con colores y animaciones según estado (online/idle/offline)
- **Búsqueda en Tiempo Real**: Filtro para buscar colaboradores
- **Contador de Usuarios**: Muestra total y usuarios en línea
- **Interfaz Clara**: Presentación mejorada con mejor espaciado
- **Botón de Acción**: Permite seleccionar usuarios para chatear

#### Estados Disponibles:
- 🟢 **online** - Usuario disponible
- 🟠 **idle** - Usuario inactivo
- 🔴 **offline** - Usuario desconectado
- 🟡 **typing** - Usuario escribiendo

#### Uso:
```html
<app-user-list></app-user-list>
```

---

### 3. 📬 **Notification Component** (`notification.component.ts`)

#### Mejoras Implementadas:
- **Auto-desaparición**: Las notificaciones se cierran automáticamente (5 segundos)
- **Tipos de Notificación**: 4 categorías con estilos distintos
- **Animaciones Suaves**: Entrada y salida con transiciones
- **Íconos Descriptivos**: Cada tipo tiene su emoji/ícono
- **Botón de Cierre Manual**: Opción para cerrar notificaciones
- **Responsive**: Se adapta a dispositivos móviles
- **Accesibilidad**: Con atributos ARIA

#### Tipos de Notificación:
```typescript
type Toast = 'info' | 'success' | 'warning' | 'error'

// ℹ️ Info (azul) - Información general
// ✅ Success (verde) - Acciones exitosas
// ⚠️ Warning (naranja) - Advertencias
// ❌ Error (rojo) - Errores (no se cierra automáticamente)
```

#### Ejemplos de Uso Automático:
- Usuario se une al chat → notificación success
- Usuario sale → notificación info
- Usuario cambia estado → notificación success/warning
- Usuario escribe → notificación info

---

### 4. 🔄 **Mock Data Service** (`mock-data.service.ts`)

#### Funcionalidad:
Proporciona datos simulados sin necesidad de base de datos para el desarrollo y testing.

#### Datos Disponibles:

**Usuarios Demo:**
- Ana García (online)
- Carlos Rodríguez (online)
- María López (idle)
- Juan Martínez (offline)
- Sofia Hernández (online)

**Documentos Demo:**
- Especificaciones del Proyecto
- Guía de Estilos
- Manual de Usuario

#### Métodos Principales:
```typescript
// Usuarios
getUsers(): Observable<User[]>
getUserById(id: number): Observable<User | undefined>
updateUserStatus(userId: number, status: UserStatus): void

// Documentos
getDocuments(): Observable<Document[]>
getDocumentsForUser(userName: string): Observable<Document[]>
createDocument(title, content, author): Observable<Document>
updateDocument(id, updates): Observable<Document | null>
shareDocument(docId, userNames): Observable<Document | null>
deleteDocument(id): Observable<boolean>

// Utilidades
resetMockData(): void  // Restaura datos iniciales
```

#### Características:
- Datos almacenados en memoria
- Actualización automática de estados de usuarios
- Observables para reactividad
- Cambios simulados cada 15 segundos

---

### 5. 🎯 **Collaboration Hub Component** (NUEVO)

#### Descripción:
Componente contenedor que integra todos los componentes de colaboración en una interfaz unificada.

#### Características:
- Layout responsive con sidebar y contenido principal
- Botón de restauración de datos
- Encabezado descriptivo
- Diseño moderno con gradientes
- Totalmente funcional sin base de datos

#### Uso:
```html
<app-collaboration-hub></app-collaboration-hub>
```

---

## Arquitectura de Datos (Sin Base de Datos)

### Flujo de Datos:

```
┌──────────────────────────────────────────────────┐
│         MockDataService                          │
│  (Datos en memoria + Observable Streams)         │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼───────┐         ┌──────────▼─────────┐
│UserSessionMgr │         │ CollaborationHub  │
│(State Mgr)    │         │   Integration     │
└───────┬───────┘         └──────────┬─────────┘
        │                            │
        ├────────┬──────────┬────────┤
        │        │          │        │
┌───────▼──┐ ┌──▼──┐ ┌──────▼─┐ ┌──▼────────┐
│  Chat    │ │User │ │Notif.  │ │ Mediator  │
│Component │ │List │ │Comp.   │ │  Service  │
└──────────┘ └─────┘ └────────┘ └───────────┘
```

### Patrones Implementados:

1. **Observer Pattern**: RxJS Observables para cambios reactivos
2. **Mediator Pattern**: Comunicación entre componentes
3. **Singleton Pattern**: Servicios proveídos en root
4. **Dependency Injection**: Angular DI para inyección de dependencias

---

## Cómo Usar

### 1. Integración en Componente Principal

```typescript
import { CollaborationHubComponent } from './shared/components/collaboration-hub/collaboration-hub.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CollaborationHubComponent],
  template: `<app-collaboration-hub></app-collaboration-hub>`
})
export class AppComponent {}
```

### 2. Uso Individual de Componentes

```typescript
import { ChatComponent } from './shared/components/chat/chat.component';
import { UserListComponent } from './shared/components/user-list/user-list.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [ChatComponent, UserListComponent, NotificationComponent],
  template: `
    <div class="container">
      <app-notifications></app-notifications>
      <div class="layout">
        <aside><app-user-list></app-user-list></aside>
        <main><app-chat></app-chat></main>
      </div>
    </div>
  `
})
export class MyPageComponent {}
```

### 3. Usar el Servicio Mock

```typescript
import { MockDataService } from './services/mock-data.service';

export class MyComponent implements OnInit {
  constructor(private mockData: MockDataService) {}
  
  ngOnInit() {
    // Obtener usuarios
    this.mockData.getUsers().subscribe(users => {
      console.log('Usuarios:', users);
    });

    // Obtener documentos
    this.mockData.getDocuments().subscribe(docs => {
      console.log('Documentos:', docs);
    });

    // Crear nuevo documento
    this.mockData.createDocument(
      'Mi Documento',
      'Contenido del documento',
      'Usuario'
    ).subscribe(doc => {
      console.log('Documento creado:', doc);
    });
  }
}
```

---

## Gestión del Estado Sin Base de Datos

### UserSessionManager
```typescript
// Administra la sesión actual de usuarios
private usersSubject = new BehaviorSubject<User[]>([]);
private eventsSubject = new Subject<UserEvent>();

// Emite eventos cuando usuarios se unen/salen
// Mantiene el estado de presencia en tiempo real
```

### MockDataService
```typescript
// Almacena datos en memoria (se pierden al recargar)
// Ideal para desarrollo y testing
// Simula cambios periódicos de estado
```

---

## Estilos y Temas

Todos los componentes utilizan:
- **Paleta de colores**: Gradientes en morado/azul (#667eea, #764ba2)
- **Tipografía**: Fuentes del sistema + estilos legibles
- **Espaciado**: Consistente con gap y padding estándar
- **Bordes**: Border-radius 6-8px para componentes
- **Sombras**: Sutiles para profundidad (0 2px 8px)
- **Animaciones**: Transiciones suaves 0.2-0.3s

---

## Funcionalidades Incluidas

✅ Chat multi-usuario en tiempo real (simulado)
✅ Lista de usuarios con indicadores de estado
✅ Notificaciones con auto-desaparición
✅ Crear nuevos usuarios dinámicamente
✅ Búsqueda de usuarios
✅ Historial de mensajes
✅ Mensajes del sistema
✅ Sin dependencia de base de datos
✅ Interfaz responsive
✅ Accesibilidad (ARIA labels)

---

## Funcionalidades Futuras

- Integración con WebSocket para chat real
- Conexión con base de datos Backend
- Compartir archivos
- Reacciones a mensajes
- Edición de mensajes
- Borrado de mensajes
- Canales temáticos
- Búsqueda de historial
- Temas oscuros/claros
- Multimedia en chat

---

## Requisitos

- Angular 19+
- RxJS 7+
- FormsModule para ngModel
- CommonModule para directivas

---

## Notas Importantes

1. **Datos Volátiles**: Los datos se pierden al recargar la página (esto es intencional para desarrollo)
2. **Rendimiento**: Óptimo para pequeñas cantidades de usuarios (< 100)
3. **Escalabilidad**: Para producción, conectar con backend real
4. **Testing**: Servicios mock hacen fácil el testing unitario

---

## Archivos Modificados/Creados

```
src/app/
├── shared/components/
│   ├── chat/
│   │   └── chat.component.ts ✨ MEJORADO
│   ├── user-list/
│   │   └── user-list.component.ts ✨ MEJORADO
│   ├── notification/
│   │   └── notification.component.ts ✨ MEJORADO
│   └── collaboration-hub/
│       └── collaboration-hub.component.ts 🆕 NUEVO
├── services/
│   └── mock-data.service.ts 🆕 NUEVO
└── core/
    └── mediator/
        └── user-session.manager.ts (sin cambios)
```

---

## Autor

Componentes creados con mejoras visuales y funcionales para colaboración en equipo.

**Última actualización**: Noviembre 2025
