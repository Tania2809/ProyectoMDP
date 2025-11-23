// Patrón: Observer — Expone streams (Observables) para suscripción a eventos y cambios de sesión.
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { User } from '../../models/usuario.model';

export type UserEvent = { type: 'joined' | 'left' | 'status' | 'typing', user: User };

@Injectable({ providedIn: 'root' })
export class UserSessionManager {
  // current list of users
  private usersSubject = new BehaviorSubject<User[]>([]);
  // stream of user events (joins, leaves, status changes)
  private eventsSubject = new Subject<UserEvent>();

  users$(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  events$(): Observable<UserEvent> {
    return this.eventsSubject.asObservable();
  }

  addUser(user: User) {
    const current = this.usersSubject.getValue();
    if (!current.find(u => u.id === user.id)) {
      this.usersSubject.next([...current, user]);
      this.eventsSubject.next({ type: 'joined', user });
    }
  }

  removeUser(userId: number) {
    const current = this.usersSubject.getValue();
    const user = current.find(u => u.id === userId);
    if (!user) return;
    this.usersSubject.next(current.filter(u => u.id !== userId));
    this.eventsSubject.next({ type: 'left', user });
  }

  updateStatus(userId: number, status: User['status']) {
    const current = this.usersSubject.getValue();
    const idx = current.findIndex(u => u.id === userId);
    if (idx === -1) return;
    const user = { ...current[idx], status };
    const next = [...current];
    next[idx] = user;
    this.usersSubject.next(next);
    this.eventsSubject.next({ type: 'status', user });
  }

  notifyTyping(userId: number) {
    const current = this.usersSubject.getValue();
    const user = current.find(u => u.id === userId);
    if (!user) return;
    this.eventsSubject.next({ type: 'typing', user });
  }
}
