import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { MediatorService } from '../../../core/mediator/mediator.service';
import { UserSessionManager, UserEvent } from '../../../core/mediator/user-session.manager';

interface Toast {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts-container" aria-live="polite" role="status" dir="ltr">
      <div *ngFor="let t of toasts" 
           [ngClass]="getToastClasses(t.type)"
           [attr.data-id]="t.id">
        <div class="toast-content">
          <span class="toast-icon">{{getIcon(t.type)}}</span>
          <span class="toast-text">{{t.text}}</span>
        </div>
        <button (click)="closeToast(t.id)" class="toast-close" aria-label="Cerrar notificación">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toasts-container {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      min-width: 280px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      pointer-events: all;
      backdrop-filter: blur(10px);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .toast-text {
      flex: 1;
      color: inherit;
      line-height: 1.4;
    }

    .toast, .toast-text { direction: ltr; }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 18px;
      padding: 0 4px;
      margin-left: 8px;
      opacity: 0.6;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      opacity: 1;
    }

    /* Info Toast */
    .toast.info {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.9) 0%, rgba(21, 101, 192, 0.9) 100%);
      color: white;
      border-left: 4px solid #2196f3;
    }

    /* Success Toast */
    .toast.success {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 100%);
      color: white;
      border-left: 4px solid #4caf50;
    }

    /* Warning Toast */
    .toast.warning {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.9) 0%, rgba(245, 127, 23, 0.9) 100%);
      color: white;
      border-left: 4px solid #ff9800;
    }

    /* Error Toast */
    .toast.error {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%);
      color: white;
      border-left: 4px solid #f44336;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .toast.removing {
      animation: slideOut 0.3s ease-in forwards;
    }

    @media (max-width: 640px) {
      .toasts-container {
        right: 10px;
        bottom: 10px;
      }

      .toast {
        min-width: 250px;
        max-width: 90vw;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;
  private idCounter = 1;
  private autoDismissTimer: Map<number, any> = new Map();
  private readonly AUTO_DISMISS_MS = 5000; // 5 seconds
  // avoid spamming typing notifications
  private typingLastShown: Record<string, number> = {};

  constructor(
    private mediator: MediatorService,
    private sessions: UserSessionManager
  ) {}

  ngOnInit() {
    try {
      this.mediator.register('Notification', this);
    } catch (e) { }

    // Subscribe to user session events
    this.sub = this.sessions.events$().subscribe((ev: UserEvent) => {
      if (!ev) return;

      if (ev.type === 'joined') {
        this.showNotification(`${ev.user.name} se ha unido`, 'success');
      }
      if (ev.type === 'left') {
        this.showNotification(`${ev.user.name} ha salido`, 'info');
      }
      if (ev.type === 'status') {
        if (ev.user.status === 'online') {
          this.showNotification(`${ev.user.name} está en línea`, 'success');
        } else if (ev.user.status === 'offline') {
          this.showNotification(`${ev.user.name} está offline`, 'warning');
        }
      }
      if (ev.type === 'typing') {
        // Throttle typing notifications per user (4s)
        const now = Date.now();
        const last = this.typingLastShown[ev.user.name] || 0;
        if (now - last > 4000) {
          this.typingLastShown[ev.user.name] = now;
          this.showNotification(`${ev.user.name} está escribiendo...`, 'info');
        }
      }
    });
  }

  ngOnDestroy() {
    try {
      this.mediator.unregister('Notification');
    } catch (e) { }
    this.sub?.unsubscribe();
    
    // Clean up all timers
    this.autoDismissTimer.forEach(t => clearTimeout(t));
    this.autoDismissTimer.clear();
  }

  // Called by MediatorService
  onMediatorEvent(sender: string, event: string, data?: any) {
    if (event === 'messageSent') {
      this.showNotification(`Mensaje de ${data.user}`, 'info');
    }
    if (event === 'error') {
      this.showNotification(data.message || 'Error desconocido', 'error');
    }
  }

  private showNotification(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const id = this.idCounter++;
    const toast: Toast = {
      id,
      text,
      type,
      createdAt: Date.now()
    };

    this.toasts.push(toast);
    
    // Auto-dismiss after delay (except for error messages)
    if (type !== 'error') {
      const timer = setTimeout(() => {
        this.closeToast(id);
      }, this.AUTO_DISMISS_MS);
      
      this.autoDismissTimer.set(id, timer);
    }
  }

  closeToast(id: number) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index > -1) {
      const element = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
      if (element) {
        element.classList.add('removing');
        setTimeout(() => {
          this.toasts.splice(index, 1);
        }, 300);
      } else {
        this.toasts.splice(index, 1);
      }
    }

    // Clear timer if exists
    if (this.autoDismissTimer.has(id)) {
      clearTimeout(this.autoDismissTimer.get(id));
      this.autoDismissTimer.delete(id);
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type] || 'ℹ️';
  }

  getToastClasses(type: string): Record<string, boolean> {
    return {
      'toast': true,
      'info': type === 'info',
      'success': type === 'success',
      'warning': type === 'warning',
      'error': type === 'error'
    };
  }
}
