import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PreferencesService } from '../../../services/factory.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class NavbarComponent implements OnInit {
theme: 'light' | 'dark' = 'light'; 

  
  constructor(private prefs: PreferencesService, private router: Router) {}

ngOnInit(): void {
  this.prefs.getTheme().subscribe(t => this.theme = t);
}

  logout() {
    this.router.navigate(['/login']);
  }
}
