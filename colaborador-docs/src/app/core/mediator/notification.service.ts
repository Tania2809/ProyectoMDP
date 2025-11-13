import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private lastMessage: string | null = null;

  show(message: string) {
    this.lastMessage = message;
    console.log('Notification:', message);
    // In a real app you'd push to a toast component or similar
  }

  getLast() { return this.lastMessage; }
}
