import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  login(usuario: string, password: string): boolean {
    // Simulación del login: usuario y contraseña fijos
    if (usuario === 'admin' && password === '1234') {
      localStorage.setItem(this.TOKEN_KEY, 'fake-jwt-token');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
