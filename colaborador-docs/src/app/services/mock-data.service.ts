import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // map sigue siendo útil
import { User, createUser } from '../models/usuario.model';

// La interfaz Document ahora debe coincidir con el modelo del backend
export interface Document {
  _id: string; // MongoDB usa _id como string
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date; 
  sharedWith: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // URL base de nuestra API de backend
  private apiUrl = 'http://localhost:3000/api';

  // Inyectamos HttpClient para hacer las peticiones
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios desde la API
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /**
   * Obtiene todos los documentos desde la API
   */
  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents`).pipe(
      // Mapeamos la respuesta para que coincida con la interfaz esperada por los componentes
      map(docs => docs.map(doc => ({
        ...doc,
        // El backend nos da authorId como un objeto, extraemos el nombre
        author: (doc.author as any)?.name || 'Desconocido',
        id: doc._id // Renombramos _id a id si los componentes lo esperan así
      } as any)))
    );
  }

  /**
   * Crea un nuevo documento llamando a la API
   */
  createDocument(title: string, content: string, author: string): Observable<Document> {
    const newDoc = { title, content, author }; // El backend se encargará del resto
    return this.http.post<Document>(`${this.apiUrl}/documents`, newDoc);
  }

  // NOTA: Los métodos como updateUserStatus, updateDocument, deleteDocument, etc.,
  // necesitarían sus propias rutas en el backend (p. ej. PUT /api/users/:id)
  // y sus correspondientes llamadas http.put(), http.delete(), etc., aquí.
}