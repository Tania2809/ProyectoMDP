import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { MediatorService } from '../../../core/mediator/mediator.service';
import { UserSessionManager, UserEvent } from '../../../core/mediator/user-session.manager';

interface Toast { id: number; text: string; }

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts" aria-live="polite">
      <div *ngFor="let t of toasts" class="toast">{{t.text}}</div>
    </div>
  `,
  styles: [`
    .toasts{position:fixed;right:16px;bottom:16px;z-index:1200;display:flex;flex-direction:column;gap:8px}
    .toast{background:#333;color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.12);font-size:0.9rem}
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;
  private idCounter = 1;

  constructor(private mediator: MediatorService, private sessions: UserSessionManager) {}

  ngOnInit() {
    // Register to receive mediator events
    try { this.mediator.register('Notification', this); } catch (e) { }

    // Subscribe to user session events (Observer pattern)
    this.sub = this.sessions.events$().subscribe((ev: UserEvent) => {
      if (!ev) return;
      if (ev.type === 'joined') this.show(`${ev.user.name} se ha unido`);
      if (ev.type === 'left') this.show(`${ev.user.name} ha salido`);
      if (ev.type === 'status') this.show(`${ev.user.name} está ${ev.user.status}`);
      if (ev.type === 'typing') this.show(`${ev.user.name} está escribiendo...`);
    });
  }

  ngOnDestroy() {
    try { this.mediator.unregister('Notification'); } catch (e) { }
    this.sub?.unsubscribe();
  }

  // Called by MediatorService when mediator.notify is invoked
  onMediatorEvent(sender: string, event: string, data?: any) {
    if (event === 'notification') {
      const text = data?.text || (data && typeof data === 'string' ? data : 'Notificación');
      this.show(text);
      return;
    }

    // generic handling for other mediator events
    if (event === 'userJoined') this.show(`${data?.user?.name || 'Alguien'} se ha unido`);
    if (event === 'userLeft') this.show(`${data?.user?.name || 'Alguien'} ha salido`);
    if (event === 'messageSent') this.show(`${data?.user}: ${data?.message}`);
  }

  show(text: string, ttl = 4000) {
    const t: Toast = { id: this.idCounter++, text };
    this.toasts.push(t);
    // remove after ttl
    const sub = timer(ttl).subscribe(() => {
      this.toasts = this.toasts.filter(x => x.id !== t.id);
      sub.unsubscribe();
    });
  }
}
