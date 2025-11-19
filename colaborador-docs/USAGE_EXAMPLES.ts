import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollaborationHubComponent } from './shared/components/collaboration-hub/collaboration-hub.component';

/**
 * EJEMPLO: Cómo integrar el Centro de Colaboración en tu aplicación
 * 
 * Este es un ejemplo de cómo usar los componentes mejorados de chat,
 * lista de usuarios y notificaciones en tu aplicación Angular.
 */

@Component({
  selector: 'app-collaboration-example',
  standalone: true,
  imports: [CommonModule, CollaborationHubComponent],
  template: `
    <!-- OPCIÓN 1: Usar el componente integrado (RECOMENDADO) -->
    <app-collaboration-hub></app-collaboration-hub>

    <!-- OPCIÓN 2: Componentes individuales (ver abajo comentado) -->
    <!-- <app-notifications></app-notifications>
    <div class="layout">
      <aside><app-user-list></app-user-list></aside>
      <main><app-chat></app-chat></main>
    </div> -->
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class CollaborationExampleComponent {}

/**
 * EJEMPLO 2: Integración en una página con otras secciones
 */
@Component({
  selector: 'app-dashboard-with-collaboration',
  standalone: true,
  imports: [CommonModule, CollaborationHubComponent],
  template: `
    <div class="dashboard-layout">
      <header class="dashboard-header">
        <h1>Mi Dashboard</h1>
      </header>

      <div class="dashboard-content">
        <section class="main-section">
          <!-- Tu contenido principal -->
          <h2>Contenido Principal</h2>
          <p>Aquí va el contenido principal de tu aplicación...</p>
        </section>

        <aside class="collaboration-section">
          <!-- Centro de Colaboración -->
          <app-collaboration-hub></app-collaboration-hub>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .dashboard-header {
      background: #f0f0f0;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }

    .dashboard-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-section {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .collaboration-section {
      width: 600px;
      border-left: 1px solid #ddd;
      overflow: hidden;
    }

    @media (max-width: 1024px) {
      .collaboration-section {
        width: 400px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        flex-direction: column;
      }

      .collaboration-section {
        width: 100%;
        border-left: none;
        border-top: 1px solid #ddd;
        height: 400px;
      }
    }
  `]
})
export class DashboardWithCollaborationComponent {}

/**
 * EJEMPLO 3: Componentes individuales con layout personalizado
 */
import { ChatComponent } from './shared/components/chat/chat.component';
import { UserListComponent } from './shared/components/user-list/user-list.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-custom-collaboration',
  standalone: true,
  imports: [CommonModule, ChatComponent, UserListComponent, NotificationComponent],
  template: `
    <!-- Notificaciones en la esquina (necesario en el root) -->
    <app-notifications></app-notifications>

    <div class="custom-layout">
      <header class="custom-header">
        <h2>Colaboración en Equipo</h2>
      </header>

      <div class="custom-content">
        <!-- Panel izquierdo: Usuarios -->
        <div class="left-panel">
          <app-user-list></app-user-list>
        </div>

        <!-- Panel central: Chat -->
        <div class="center-panel">
          <app-chat></app-chat>
        </div>

        <!-- Panel derecho: Información adicional -->
        <div class="right-panel">
          <div class="info-box">
            <h3>Información</h3>
            <p>Esta es tu sección de información personalizada</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .custom-header {
      background: #f5f5f5;
      padding: 16px;
      border-bottom: 1px solid #ddd;
    }

    .custom-content {
      display: flex;
      flex: 1;
      gap: 12px;
      padding: 12px;
      overflow: hidden;
    }

    .left-panel {
      width: 250px;
      overflow: hidden;
    }

    .center-panel {
      flex: 1;
      overflow: hidden;
    }

    .right-panel {
      width: 250px;
      overflow-y: auto;
    }

    .info-box {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .info-box h3 {
      margin-top: 0;
    }

    @media (max-width: 1200px) {
      .custom-content {
        gap: 8px;
        padding: 8px;
      }

      .left-panel,
      .right-panel {
        width: 200px;
      }
    }

    @media (max-width: 768px) {
      .custom-content {
        flex-direction: column;
      }

      .left-panel,
      .right-panel {
        width: 100%;
        height: 200px;
      }

      .center-panel {
        height: 300px;
      }
    }
  `]
})
export class CustomCollaborationComponent {}

/**
 * EJEMPLO 4: Uso del servicio MockDataService
 */
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private initialUsers = [{ id: 1, name: 'Alice', status: 'online' }];
  private initialDocuments = [{ id: 1, title: 'Documento 1', author: 'Alice' }];

  private users: any[] = [...this.initialUsers];
  private documents: any[] = [...this.initialDocuments];

  getUsers(): Observable<any[]> {
    return of(this.users);
  }

  getDocuments(): Observable<any[]> {
    return of(this.documents);
  }

  resetMockData(): void {
    this.users = [...this.initialUsers];
    this.documents = [...this.initialDocuments];
  }

  // Optional helper to add documents/users if needed by examples
  createDocument(doc: any): void {
    this.documents = [...this.documents, doc];
  }
}

@Component({
  selector: 'app-data-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-example">
      <h2>Ejemplo de Datos Mock</h2>

      <section>
        <h3>Usuarios ({{users.length}})</h3>
        <ul>
          <li *ngFor="let user of users">
            {{user.name}} - <strong>{{user.status}}</strong>
          </li>
        </ul>
      </section>

      <section>
        <h3>Documentos ({{documents.length}})</h3>
        <ul>
          <li *ngFor="let doc of documents">
            <strong>{{doc.title}}</strong> by {{doc.author}}
          </li>
        </ul>
      </section>

      <section>
        <button (click)="resetData()">Restaurar Datos</button>
      </section>
    </div>
  `,
  styles: [`
    .data-example {
      padding: 20px;
    }

    section {
      margin: 20px 0;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    button {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }
  `]
})
export class DataExampleComponent implements OnInit, OnDestroy {
  users: any[] = [];
  documents: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private mockData: MockDataService) {}

  ngOnInit() {
    const userSub = this.mockData.getUsers().subscribe(u => {
      this.users = u || [];
    });
    this.subscriptions.push(userSub);

    const docSub = this.mockData.getDocuments().subscribe(d => {
      this.documents = d || [];
    });
    this.subscriptions.push(docSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  resetData() {
    this.mockData.resetMockData();
  }
}

/**
 * GUÍA DE INTEGRACIÓN:
 *
 * 1. OPCIÓN MÁS SIMPLE (Recomendado):
 *    Importa CollaborationHubComponent en tu componente principal
 *    <app-collaboration-hub></app-collaboration-hub>
 *
 * 2. OPCIÓN PERSONALIZADA:
 *    Importa los componentes individuales y crea tu propio layout
 *    <app-chat></app-chat>
 *    <app-user-list></app-user-list>
 *    <app-notifications></app-notifications>
 *
 * 3. DATOS:
 *    Usa MockDataService para obtener datos en tiempo real
 *    mockData.getUsers()
 *    mockData.getDocuments()
 *    mockData.createDocument(...)
 *
 * 4. ASEGÚRATE DE:
 *    - Importar CommonModule
 *    - Importar FormsModule (necesario para ngModel en los componentes)
 *    - Importar los componentes standalone
 *    - Incluir NotificationComponent en el root o en componente padre
 *
 * NOTAS:
 * - Los datos se almacenan en memoria (se pierden al recargar)
 * - Los componentes son standalone (no necesitan NgModule)
 * - Uso de Observables/RxJS para reactividad
 * - Totalmente funcional sin base de datos
 */
