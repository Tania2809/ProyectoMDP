import { Injectable } from '@angular/core';

export type DocumentType = 'PDF' | 'Word' | 'Excel';
export interface Document {
  id: number;
  name: string;
  type: DocumentType;
}
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private counter = 1;
  private documents: Document[] = [];

  constructor() {
    this.createDocument('Documento A', 'PDF');
    this.createDocument('Documento B', 'Word');
    this.createDocument('Documento C', 'Excel');
  }

  createDocument(name: string, type: DocumentType): Document {
    const doc: Document = { id: this.counter++, name, type };
    this.documents.push(doc);
    return doc;
  }

  getDocuments(): Document[] {
    return this.documents;
  }
}
