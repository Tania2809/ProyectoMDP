import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  
  // 🔒 Rutas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard-personal/dashboard-personal.component')
      .then(m => m.DashboardPersonalComponent)
  },
  {
    path: 'documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/documentos/documentos.component')
      .then(m => m.DocumentosComponent)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.component')
      .then(m => m.PerfilComponent)
  },

  { path: '**', redirectTo: 'login' }
];
