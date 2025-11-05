import { Routes } from '@angular/router';



import { DashboardPersonalComponent } from './pages/dashboard-personal/dashboard-personal.component';
import { DocumentosComponent } from './pages/documentos/documentos.component';
import { DocumentoDetalleComponent } from './pages/documento-detalle/documento-detalle.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
     { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPersonalComponent },
  { path: 'documentos', component: DocumentosComponent },
  { path: 'documentos/:id', component: DocumentoDetalleComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: 'dashboard' }
];
