import { Component, OnInit } from '@angular/core';
import { PreferencesService } from '../../services/factory.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class PerfilComponent implements OnInit {

  theme!: 'light' | 'dark';
  language!: string;
  notifications!: boolean;
  fontSize!: number;
  sidebarCollapsed!: boolean;
selectedTheme: any;

  constructor(private prefs: PreferencesService) {}

  ngOnInit(): void {
    // Suscribirse a las preferencias actuales
    this.prefs.getTheme().subscribe(t => this.theme = t);
    this.prefs.getLanguage().subscribe(l => this.language = l);
    this.prefs.getNotifications().subscribe(n => this.notifications = n);
    this.prefs.getFontSize().subscribe(f => this.fontSize = f);
    this.prefs.getSidebarCollapsed().subscribe(s => this.sidebarCollapsed = s);
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

  resetPreferences() {
    this.prefs.resetPreferences();
  }
}
