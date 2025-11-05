import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly MOCK_USER = {
    email: 'admin@demo.com',
    password: '123456'
  };

  constructor() {}

  login(email: string, password: string): Observable<any> {
    if (email === this.MOCK_USER.email && password === this.MOCK_USER.password) {
      const fakeToken = 'FAKE_TOKEN_12345';
      return of({ token: fakeToken });
    } else {
      return throwError(() => new Error('Credenciales inválidas'));
    }
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}
