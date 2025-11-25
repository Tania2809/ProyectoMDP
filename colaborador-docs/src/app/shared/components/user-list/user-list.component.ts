import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserSessionManager } from '../../../core/mediator/user-session.manager';
import { User } from '../../../models/usuario.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-list-container">
      <div class="list-header">
        <h5>👥 Colaboradores</h5>
        <span class="badge">{{users.length}}</span>
      </div>

      <div class="search-container">
        <input 
          [(ngModel)]="searchTerm"
          placeholder="Buscar colaborador..."
          class="search-input" />
      </div>

      <ul class="users-list">
        <li *ngFor="let u of filteredUsers" 
            [ngClass]="{'user-item': true, 'online': u.status === 'online', 'idle': u.status === 'idle', 'typing': u.status === 'typing', 'offline': u.status === 'offline' || !u.status}">
          <div class="user-avatar">{{getInitials(u.name)}}</div>
          <div class="user-info">
            <span class="user-name">{{u.name}}</span>
            <span class="user-status" [attr.data-status]="u.status || 'offline'">
              <span class="status-indicator"></span>
              {{u.status || 'offline'}}
            </span>
          </div>
          <div class="user-actions">
            <button (click)="selectUser(u)" 
                    class="action-btn chat-btn"
                    title="Chatear">
              💬
            </button>
          </div>
        </li>
      </ul>

      <div class="empty-state" *ngIf="users.length === 0">
        <p>No hay colaboradores disponibles</p>
      </div>

      <div class="list-footer">
        <small>{{onlineCount}} en línea</small>
      </div>
    </div>
  `,
  styles: [`
    .user-list-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .list-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .list-header h5 {
      margin: 0;
      font-size: 15px;
    }

    .badge {
      background: rgba(255,255,255,0.3);
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .search-container {
      padding: 8px 12px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-input {
      width: 100%;
      padding: 7px 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .users-list {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
      overflow-y: auto;
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
      background: white;
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .user-item:hover {
      background: #f5f5f5;
    }

    .user-item.online {
      --status-color: #4caf50;
    }

    .user-item.idle {
      --status-color: #ff9800;
    }

    .user-item.typing {
      --status-color: #2196f3;
      background: #e3f2fd;
    }

    .user-item.offline {
      --status-color: #999;
      opacity: 0.7;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      margin-right: 10px;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--status-color, #999);
      animation: pulse 2s infinite;
    }

    .user-item.offline .status-indicator {
      animation: none;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .user-actions {
      display: flex;
      gap: 6px;
      margin-left: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 16px;
      opacity: 0.6;
      transition: opacity 0.2s;
      border-radius: 4px;
    }

    .action-btn:hover {
      opacity: 1;
      background: rgba(102, 126, 234, 0.1);
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: #999;
      font-style: italic;
    }

    .empty-state p {
      margin: 0;
    }

    .list-footer {
      background: white;
      padding: 8px 12px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .users-list::-webkit-scrollbar {
      width: 6px;
    }

    .users-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .users-list::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .users-list::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  searchTerm = '';
  private sub?: Subscription;

  constructor(private sessions: UserSessionManager) {}

  ngOnInit() {
    this.sub = this.sessions.users$().subscribe(u => {
      this.users = u || [];
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm.trim()) {
      return this.users;
    }
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u => u.name.toLowerCase().includes(term));
  }

  get onlineCount(): number {
    return this.users.filter(u => u.status === 'online').length;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  selectUser(user: User) {
    console.log('Seleccionado:', user.name);
    // Emit event or update chat selection
  }
}
