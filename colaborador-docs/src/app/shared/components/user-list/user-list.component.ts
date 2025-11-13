import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserSessionManager } from '../../../core/mediator/user-session.manager';
import { User } from '../../../models/usuario.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-list">
      <h5>Colaboradores</h5>
      <ul>
        <li *ngFor="let u of users">{{u.name}} <small class="muted">({{u.status || 'offline'}})</small></li>
      </ul>
    </div>
  `,
  styles: ['.user-list{padding:8px;background:#fafafa;border:1px solid #eee;border-radius:6px}.user-list ul{list-style:none;padding:0;margin:0}.user-list li{padding:4px 0}.muted{color:#666;font-size:0.8rem}']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  private sub?: Subscription;

  constructor(private sessions: UserSessionManager) {}

  ngOnInit() {
    this.sub = this.sessions.users$().subscribe(u => this.users = u || []);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
