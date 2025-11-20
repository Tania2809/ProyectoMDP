import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MediatorService } from '../../../core/mediator/mediator.service';
import { CollaborationMediator } from '../../../core/mediator/collaboration-mediator.service';
import { UserSessionManager } from '../../../core/mediator/user-session.manager';
import { User, createUser } from '../../../models/usuario.model';

interface Message {
  id: number;
  user: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
  userId?: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h4>💬 Chat de Colaboración</h4>
        <span class="user-count">{{users.length}} colaborador(es)</span>
      </div>
      
      <div class="messages-container" #messagesDiv>
        <div class="no-messages" *ngIf="messages.length === 0">
          <p>No hay mensajes aún. ¡Comienza la conversación!</p>
        </div>
        
        <div *ngFor="let msg of messages" 
             [ngClass]="{'message': true, 'system': msg.isSystem, 'own': isOwnMessage(msg), 'other': !isOwnMessage(msg) && !msg.isSystem}">
          <div class="message-header" *ngIf="!msg.isSystem">
            <span class="user-name">{{msg.user}}</span>
            <span class="timestamp">{{msg.timestamp | date:'HH:mm:ss'}}</span>
          </div>
          <div class="message-content">{{msg.message}}</div>
        </div>
      </div>

      <div class="chat-input-section">
        <select [(ngModel)]="draftUser" class="user-select">
          <option value="">Selecciona un usuario...</option>
          <option *ngFor="let u of users" [value]="u.name">{{u.name}} ({{u.status}})</option>
          <option value="">-- Nuevo usuario --</option>
        </select>
        <div *ngIf="draftUser === ''" class="new-user-wrapper">
          <input 
            [(ngModel)]="newUserName" 
            placeholder="Nombre del nuevo usuario"
            class="new-user-input" />
          <button (click)="addNewUser()" class="add-user-btn">Añadir</button>
        </div>
        
        <div class="message-input-wrapper">
          <textarea 
            [(ngModel)]="draftMessage" 
            placeholder="Escribe tu mensaje..." 
            class="message-input"
            rows="3"></textarea>
          <button (click)="sendHere()" 
                  [disabled]="!draftMessage.trim() || !draftUser"
                  class="send-btn">
            Enviar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h4 {
      margin: 0;
      font-size: 18px;
    }

    .user-count {
      background: rgba(255,255,255,0.3);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .no-messages {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
      font-style: italic;
    }

    .message {
      display: flex;
      flex-direction: column;
      max-width: 70%;
      word-wrap: break-word;
    }

    .message.own {
      align-self: flex-end;
      background: #667eea;
      color: white;
      padding: 10px 14px;
      border-radius: 12px 12px 4px 12px;
    }

    .message.other {
      align-self: flex-start;
      background: white;
      color: #333;
      padding: 10px 14px;
      border-radius: 12px 12px 12px 4px;
      border: 1px solid #e0e0e0;
    }

    .message.system {
      align-self: center;
      background: #e8eaf6;
      color: #555;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-style: italic;
      direction: ltr;
      text-align: left;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .message.own .message-header {
      color: rgba(255,255,255,0.9);
    }

    .user-name {
      font-weight: 600;
    }

    .timestamp {
      opacity: 0.7;
      margin-left: 8px;
    }

    .message-content {
      word-break: break-word;
      line-height: 1.4;
      direction: ltr;
    }

    .chat-input-section {
      background: white;
      padding: 12px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .new-user-wrapper {
      display: flex;
      gap: 8px;
    }

    .new-user-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
    }

    .new-user-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .add-user-btn {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: opacity 0.2s;
    }

    .add-user-btn:hover {
      opacity: 0.9;
    }

    .user-select, .new-user-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
    }

    .user-select:focus, .new-user-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .message-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .message-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      resize: none;
    }

    .message-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .send-btn {
      padding: 8px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesDiv') private messagesDiv?: ElementRef;
  
  messages: Message[] = [];
  users: User[] = [];
  draftUser = '';
  draftMessage = '';
  newUserName = '';
  private messageId = 0;
  private subscriptions: Subscription[] = [];
  private shouldScroll = true;
  // Track last content update per document to avoid flooding system messages
  private lastContentUpdate: Record<number, { ts: number; messageId?: number }> = {};

  constructor(
    private mediator: MediatorService,
    private collaboration: CollaborationMediator,
    private sessions: UserSessionManager
  ) {}

  ngOnInit() {
    this.mediator.register('Chat', this);
    
    // Subscribe to users updates
    const usersSub = this.sessions.users$().subscribe(u => {
      this.users = u || [];
    });
    this.subscriptions.push(usersSub);

    // Initialize with some demo users if empty
    if (this.users.length === 0) {
      this.sessions.addUser(createUser(1, 'Ana', 'online'));
      this.sessions.addUser(createUser(2, 'Carlos', 'online'));
      this.sessions.addUser(createUser(3, 'María', 'online'));
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.mediator.unregister('Chat');
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  scrollToBottom() {
    try {
      if (this.messagesDiv) {
        this.messagesDiv.nativeElement.scrollTop = this.messagesDiv.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  isOwnMessage(msg: Message): boolean {
    return msg.user === this.draftUser && !msg.isSystem;
  }

  addNewUser() {
    if (!this.newUserName.trim()) return;
    
    const newUser = createUser(Date.now(), this.newUserName.trim(), 'online');
    this.sessions.addUser(newUser);
    
    this.addSystemMessage(`${this.newUserName} se ha unido al chat`);
    this.newUserName = '';
    this.draftUser = this.newUserName;
  }

  sendMessage(user: string, message: string) {
    this.collaboration.sendMessage(user, message);
  }

  onMediatorEvent(sender: string, event: string, data?: any) {
    if (event === 'messageSent') {
      this.messages.push({
        id: ++this.messageId,
        user: data.user,
        message: data.message,
        timestamp: new Date(),
        userId: data.userId
      });
      this.shouldScroll = true;
    }
    if (event === 'contentUpdated') {
      // data expected: { id: docId, content, author }
      const docId = data?.id || 0;
      const now = Date.now();
      const last = this.lastContentUpdate[docId];
      const text = data?.author ? `Contenido actualizado por ${data.author}` : `Contenido actualizado`;

      // If recent update for same doc exists (within 8s), update that system message instead of pushing a new one
      if (last && (now - last.ts) < 8000 && last.messageId) {
        const idx = this.messages.findIndex(m => m.id === last.messageId);
        if (idx > -1) {
          this.messages[idx].message = `${text} · ${new Date().toLocaleTimeString()}`;
          this.messages[idx].timestamp = new Date();
        } else {
          // fallback: push a new system message
          const id = ++this.messageId;
          this.messages.push({ id, user: 'Sistema', message: `${text} · ${new Date().toLocaleTimeString()}`, timestamp: new Date(), isSystem: true });
          this.lastContentUpdate[docId] = { ts: now, messageId: id };
        }
      } else {
        const id = ++this.messageId;
        this.messages.push({ id, user: 'Sistema', message: `${text} · ${new Date().toLocaleTimeString()}`, timestamp: new Date(), isSystem: true });
        this.lastContentUpdate[docId] = { ts: now, messageId: id };
      }

      this.shouldScroll = true;
    }
  }

  private addSystemMessage(text: string) {
    const id = ++this.messageId;
    this.messages.push({ id, user: 'Sistema', message: text, timestamp: new Date(), isSystem: true });
    this.shouldScroll = true;
  }

  sendHere(event?: any) {
    if (event && event.ctrlKey && event.key === 'Enter') {
      this.send();
    } else if (!event) {
      this.send();
    }
  }

  private send() {
    if (!this.draftMessage.trim() || !this.draftUser) return;
    
    // Ensure user exists
    const existing = this.users.find(x => x.name === this.draftUser);
    if (!existing) {
      const u = createUser(Date.now(), this.draftUser, 'online');
      this.sessions.addUser(u);
    }
    
    this.sendMessage(this.draftUser, this.draftMessage);
    this.draftMessage = '';
  }
}
