import { Component, OnInit } from '@angular/core';
import { PreferencesService } from '../../services/factory.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PerfilComponent implements OnInit {
  theme!: 'light' | 'dark';
  language!: string;
  notifications!: boolean;
  fontSize!: number;
  sidebarCollapsed!: boolean;
  selectedTheme: 'light' | 'dark' = 'light';

  // Profile-specific additions (stored locally here, not in PreferencesService)
  displayName: string = '';
  avatarUrl: string = '';

  constructor(private prefs: PreferencesService) {}

  ngOnInit(): void {
    // Suscribirse a las preferencias actuales
    this.prefs.getTheme().subscribe(t => { this.theme = t; this.selectedTheme = t; });
    this.prefs.getLanguage().subscribe(l => this.language = l);
    this.prefs.getNotifications().subscribe(n => this.notifications = n);
    this.prefs.getFontSize().subscribe(f => this.fontSize = f);
    this.prefs.getSidebarCollapsed().subscribe(s => this.sidebarCollapsed = s);

    // Load profile fields from localStorage (non-factory personalizations)
    const name = localStorage.getItem('profile.displayName');
    const avatar = localStorage.getItem('profile.avatarUrl');
    if (name) this.displayName = name;
    if (avatar) this.avatarUrl = avatar;
  }


changeTheme(theme: 'light' | 'dark') {
  this.prefs.setTheme(theme); 
}


  changeLanguage(value: string) {
    this.prefs.setLanguage(value);
  }

  toggleNotifications(value: boolean) {
    this.prefs.setNotifications(value);
  }

  changeFontSize(value: number) {
    this.prefs.setFontSize(Number(value));
  }

  toggleSidebar(value: boolean) {
    this.prefs.setSidebarCollapsed(value);
  }

  // Local profile personalization methods
  saveDisplayName() {
    localStorage.setItem('profile.displayName', this.displayName || '');
  }

  saveAvatarUrl() {
    localStorage.setItem('profile.avatarUrl', this.avatarUrl || '');
  }

  resetPreferences() {
    this.prefs.resetPreferences();
  }

  
}
