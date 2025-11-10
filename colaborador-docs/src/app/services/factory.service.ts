import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class PreferencesService {

  private theme$ = new BehaviorSubject<'light' | 'dark'>('light'); // Tema de la app
  private language$ = new BehaviorSubject<string>('es');           // Idioma
  private notifications$ = new BehaviorSubject<boolean>(true);     // Notificaciones activadas
  private fontSize$ = new BehaviorSubject<number>(14);             // Tamaño de fuente
  private sidebarCollapsed$ = new BehaviorSubject<boolean>(false);// Estado del sidebar

  constructor() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedLanguage = localStorage.getItem('language');
    const savedNotifications = localStorage.getItem('notifications');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedSidebar = localStorage.getItem('sidebarCollapsed');

    if (savedTheme) this.theme$.next(savedTheme);
    if (savedLanguage) this.language$.next(savedLanguage);
    if (savedNotifications) this.notifications$.next(savedNotifications === 'true');
    if (savedFontSize) this.fontSize$.next(Number(savedFontSize));
    if (savedSidebar) this.sidebarCollapsed$.next(savedSidebar === 'true');
  }


  getTheme(): Observable<'light' | 'dark'> {
    return this.theme$.asObservable();
  }

  getLanguage(): Observable<string> {
    return this.language$.asObservable();
  }

  getNotifications(): Observable<boolean> {
    return this.notifications$.asObservable();
  }

  getFontSize(): Observable<number> {
    return this.fontSize$.asObservable();
  }

  getSidebarCollapsed(): Observable<boolean> {
    return this.sidebarCollapsed$.asObservable();
  }


  setTheme(theme: 'light' | 'dark') {
    this.theme$.next(theme);
    localStorage.setItem('theme', theme);
  }

  setLanguage(language: string) {
    this.language$.next(language);
    localStorage.setItem('language', language);
  }

  setNotifications(enabled: boolean) {
    this.notifications$.next(enabled);
    localStorage.setItem('notifications', enabled.toString());
  }

  setFontSize(size: number) {
    this.fontSize$.next(size);
    localStorage.setItem('fontSize', size.toString());
  }

  setSidebarCollapsed(collapsed: boolean) {
    this.sidebarCollapsed$.next(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }

  resetPreferences() {
    this.setTheme('light');
    this.setLanguage('es');
    this.setNotifications(true);
    this.setFontSize(14);
    this.setSidebarCollapsed(false);
  }
}
