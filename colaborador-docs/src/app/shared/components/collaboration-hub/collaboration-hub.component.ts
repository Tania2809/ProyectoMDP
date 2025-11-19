import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { UserListComponent } from '../user-list/user-list.component';
import { NotificationComponent } from '../notification/notification.component';
import { UserSessionManager } from '../../../core/mediator/user-session.manager';
import { MockDataService } from '../../../services/mock-data.service';
import { createUser } from '../../../models/usuario.model';

@Component({
  selector: 'app-collaboration-hub',
  standalone: true,
  imports: [CommonModule, ChatComponent, UserListComponent, NotificationComponent],
  template: `
    <div class="collaboration-hub">
      <app-notifications></app-notifications>
      
      <div class="hub-header">
        <div class="header-content">
          <h1>🤝 Centro de Colaboración</h1>
          <p class="subtitle">Colabora en tiempo real con tu equipo</p>
        </div>
        <div class="header-actions">
          <button (click)="resetData()" class="reset-btn" title="Restaurar datos iniciales">
            🔄 Restaurar
          </button>
        </div>
      </div>

      <div class="hub-layout">
        <aside class="sidebar">
          <app-user-list></app-user-list>
        </aside>

        <main class="main-content">
          <app-chat></app-chat>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .collaboration-hub {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
    }

    .hub-header {
      background: rgba(255, 255, 255, 0.95);
      padding: 20px 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 700;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .reset-btn {
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .reset-btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .reset-btn:active {
      transform: translateY(0);
    }

    .hub-layout {
      display: flex;
      flex: 1;
      gap: 16px;
      padding: 16px;
      overflow: hidden;
    }

    .sidebar {
      width: 320px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 1024px) {
      .hub-layout {
        gap: 12px;
      }

      .sidebar {
        width: 280px;
      }
    }

    @media (max-width: 768px) {
      .collaboration-hub {
        height: auto;
        min-height: 100vh;
      }

      .hub-header {
        padding: 16px;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .hub-layout {
        flex-direction: column;
        padding: 12px;
        gap: 12px;
      }

      .sidebar {
        width: 100%;
        height: 250px;
      }

      .main-content {
        height: 400px;
      }
    }

    @media (max-width: 480px) {
      .hub-header {
        padding: 12px;
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .header-content h1 {
        font-size: 20px;
      }

      .hub-layout {
        padding: 8px;
        gap: 8px;
      }

      .sidebar {
        height: 200px;
      }

      .main-content {
        height: 300px;
      }
    }
  `]
})
export class CollaborationHubComponent implements OnInit {
  constructor(
    private sessions: UserSessionManager,
    private mockData: MockDataService
  ) {}

  ngOnInit() {
    this.initializeCollaboration();
  }

  private initializeCollaboration(): void {
    // Subscribe to mock users and add them to the session manager
    this.mockData.getUsers().subscribe(users => {
      // Sync with session manager
      const currentUsers = this.sessions.users$().subscribe(sessionUsers => {
        const sessionIds = new Set(sessionUsers?.map(u => u.id) || []);
        
        users.forEach(user => {
          if (!sessionIds.has(user.id)) {
            this.sessions.addUser(user);
          }
        });
        
        // Update status for existing users
        users.forEach(user => {
          const existingUser = sessionUsers?.find(u => u.id === user.id);
          if (existingUser && existingUser.status !== user.status) {
            this.sessions.updateStatus(user.id, user.status || 'offline');
          }
        });

        currentUsers.unsubscribe();
      });
    });
  }

  resetData(): void {
    this.mockData.resetMockData();
    this.initializeCollaboration();
  }
}