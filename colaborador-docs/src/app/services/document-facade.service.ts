// Patrón: Facade — Orquesta llamadas al backend y al mediador para las vistas de documento.
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Document } from './documentos.service';
import { CollaborationMediator } from '../core/mediator/collaboration-mediator.service';
import { DocumentApiService } from './document-api.service';

@Injectable({ providedIn: 'root' })
export class DocumentFacade {
  constructor(private api: DocumentApiService, private collaboration: CollaborationMediator) {}

  getDocumentById(id: number): Observable<Document | undefined> {
    return this.api.get(id).pipe(
      map(doc => doc ? { ...doc } : undefined),
      catchError(() => of(undefined))
    );
  }

  getAllDocuments(): Observable<Document[]> {
    return this.api.list().pipe(catchError(() => of([])));
  }

  saveDocument(document: Document): Observable<Document | undefined> {
    // If the document has an id, update. Otherwise create.
    if ((document as any).id) {
      return this.api.update((document as any).id, document).pipe(
        map(d => {
          // notify collaborators if content changed (best-effort)
          this.collaboration.contentUpdated((d as any).id, d.content || '', undefined);
          return d;
        }),
        catchError(() => of(undefined))
      );
    }
    return this.api.create(document as Partial<Document>).pipe(
      map(d => d),
      catchError(() => of(undefined))
    );
  }

  notifyContentUpdated(docId: number, content: string, author?: string) {
    this.collaboration.contentUpdated(docId, content, author);
  }
}
