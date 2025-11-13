import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediatorService } from '../../../core/mediator/mediator.service';
import { CollaborationMediator } from '../../../core/mediator/collaboration-mediator.service';
import { UserSessionManager } from '../../../core/mediator/user-session.manager';
import { User, createUser } from '../../../models/usuario.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-box">
      <h4>Chat</h4>
      <div class="messages">{{messages.join('\n')}}</div>
      <div class="chat-actions">
        <input [(ngModel)]="draftUser" placeholder="Usuario" />
        <input [(ngModel)]="draftMessage" placeholder="Mensaje" />
        <button (click)="sendHere()">Enviar</button>
      </div>
    </div>
  `,
  styles: ['.chat-box{padding:12px;border:1px solid #eee;border-radius:6px;background:#fff}.messages{white-space:pre-wrap;font-size:0.9rem;color:#333}.chat-actions{margin-top:8px;display:flex;gap:6px}']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  users: User[] = [];
  draftUser = 'Usuario';
  draftMessage = '';

  constructor(private mediator: MediatorService, private collaboration: CollaborationMediator, private sessions: UserSessionManager) {}

  ngOnInit() {
    this.mediator.register('Chat', this);
    // subscribe to presence updates
    this.sessions.users$().subscribe(u => this.users = u || []);
  }

  ngOnDestroy() { this.mediator.unregister('Chat'); }

  sendMessage(user: string, message: string) {
    this.collaboration.sendMessage(user, message);
  }

  onMediatorEvent(sender: string, event: string, data?: any) {
    if (event === 'messageSent') {
      this.messages.push(`${data.user}: ${data.message}`);
    }
    if (event === 'contentUpdated') {
      this.messages.push(`(sistema) Contenido actualizado por ${sender}`);
    }
  }

  sendHere() {
    if (!this.draftMessage || !this.draftUser) return;
    // ensure user exists in session (quick demo: create minimal user if missing)
    const existing = this.users.find(x => x.name === this.draftUser);
    if (!existing) {
      const u = createUser(Date.now(), this.draftUser, 'online');
      this.sessions.addUser(u);
    }
    this.sendMessage(this.draftUser, this.draftMessage);
    this.draftMessage = '';
  }
}
