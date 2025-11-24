import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { Observable } from 'rxjs';
import { User, createUser } from '../models/usuario.model';

// La interfaz Document ahora debe coincidir con el modelo del backend
export interface Document {
  _id: string; // MongoDB usa _id como string
  title: string;
  content: string;
  type: string; // Añadimos el tipo
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
    return this.http.get<Document[]>(`${this.apiUrl}/documents`);
  }

  /**
   * Crea un nuevo documento llamando a la API
   */
  createDocument(title: string, content: string, author: string, type: string): Observable<Document> {
    const newDoc = { title, content, author, type }; // Incluimos el tipo en el cuerpo de la petición
    return this.http.post<Document>(`${this.apiUrl}/documents`, newDoc);
  }

  /**
   * Obtiene un documento por su ID
   */
  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}`);
  }

  /**
   * Actualiza un documento existente (título y contenido)
   */
  updateDocument(id: string, title: string, content: string): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/documents/${id}`, { title, content });
  }

  /**
   * Elimina un documento por su ID
   */
  deleteDocument(id: string): Observable<any> {
    // La respuesta en caso de éxito no tiene un cuerpo, por eso usamos 'any'
    return this.http.delete(`${this.apiUrl}/documents/${id}`);
  }
}