import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from './documentos.service';

@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private base = '/api/documents';

  constructor(private http: HttpClient) {}

  list(): Observable<Document[]> {
    return this.http.get<Document[]>(this.base);
  }

  get(id: string | number): Observable<Document> {
    return this.http.get<Document>(`${this.base}/${id}`);
  }

  create(doc: Partial<Document>): Observable<Document> {
    return this.http.post<Document>(this.base, doc);
  }

  update(id: string | number, doc: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.base}/${id}`, doc);
  }

  delete(id: string | number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
