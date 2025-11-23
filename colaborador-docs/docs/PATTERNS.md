# Patrones aplicados (ubicación discreta)

Este archivo lista, de forma compacta y discreta, qué patrón de diseño se ha utilizado y dónde encontrar su implementación en el proyecto.

- **Mediator**
  - Implementación: `src/app/core/mediator/mediator.service.ts`
  - Adaptador / fachada de colaboración: `src/app/core/mediator/collaboration-mediator.service.ts`
  - Uso / consumidores: `src/app/shared/components/notification/notification.component.ts`, `src/app/pages/documentos/documentos.component.ts` (registro y eventos)

- **Facade (Fachada)**
  - Document facade: `src/app/services/document-facade.service.ts` — orquesta llamadas al backend y al mediator para la vista de detalle.
  - CollaborationFacade: `src/app/core/mediator/collaboration-mediator.service.ts` actúa también como fachada de colaboración sobre `MediatorService` + `UserSessionManager`.

- **Observer (Observer / PubSub via RxJS)**
  - Implementación: `src/app/core/mediator/user-session.manager.ts` (expone `users$()` y `events$()` que otros componentes se suscriben).
  - Consumidores: `src/app/shared/components/notification/notification.component.ts` y componentes de sesión.

- **Singleton**
  - Implementación práctica: servicios Angular con `@Injectable({ providedIn: 'root' })` actúan como singletons: p. ej. `MediatorService`, `UserSessionManager`, `DocumentFacade`, `DocumentApiService`, `DocumentService`.

- **Factory (Factory Method / Servicio Factory implícito)**
  - Implementación directa: `src/app/services/documentos.service.ts` contiene `createDocument(...)` que crea y registra documentos.
  - También existe un patrón de fábrica en `server/seed.js` (creación inicial) y servicios que encapsulan creación de entidades.

- **Decorator (Patrón estructural)**
  - Implementación: `src/app/services/renderer.service.ts`:
    - `MarkdownRenderer` (implementa `Renderer`).
    - `SyntaxHighlighterDecorator` (extiende `RendererDecorator`) — envuelve la salida para añadir marcado/estilos.
  - Integración en UI: `src/app/pages/documento-detalle/documento-detalle.component.ts` (vista previa renderizada).

Notas breves
- He mantenido las implementaciones como servicios/pequeños módulos para que puedas localizarlas y reemplazarlas sin tocar la UI.
- Si quieres, puedo añadir marcas comentadas (una línea) al inicio de cada archivo que indique el patrón. Las dejé fuera para mantener los archivos de código limpios; aquí están centralizadas.
