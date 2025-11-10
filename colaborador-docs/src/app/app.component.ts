import { Component, OnInit } from '@angular/core';
import { PreferencesService } from './services/factory.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private prefs: PreferencesService) {}

ngOnInit(): void {
  this.prefs.getTheme().subscribe(theme => {
    document.body.className = theme; // cambia toda la pantalla
  });

  this.prefs.getFontSize().subscribe(size => {
    document.documentElement.style.fontSize = size + 'px';
  });
}

}
