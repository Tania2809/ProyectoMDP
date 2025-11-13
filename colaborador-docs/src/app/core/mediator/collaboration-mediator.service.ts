import { Injectable } from '@angular/core';
import { MediatorService } from './mediator.service';
import { UserSessionManager } from './user-session.manager';
import { User } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class CollaborationMediator {
  constructor(private mediator: MediatorService, private sessions: UserSessionManager) {}

  sendMessage(user: string, message: string) {
    this.mediator.notify('Chat', 'messageSent', { user, message });
  }

  contentUpdated(docId: number, content: string, author?: string) {
    this.mediator.notify('Editor', 'contentUpdated', { id: docId, content, author });
  }

  userJoined(user: User) {
    this.sessions.addUser(user);
    this.mediator.notify('System', 'userJoined', { user });
  }

  userLeft(userId: number) {
    this.sessions.removeUser(userId);
    this.mediator.notify('System', 'userLeft', { id: userId });
  }

  updateUserStatus(userId: number, status: User['status']) {
    this.sessions.updateStatus(userId, status);
    // use 'notification' event to broadcast status changes
    this.mediator.notify('System', 'notification', { id: userId, status });
  }
}
