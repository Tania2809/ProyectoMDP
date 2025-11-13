import { Injectable } from '@angular/core';

export type DocumentType = 'PDF' | 'Word' | 'Excel';

export interface Document {
  id: number;
  name: string;
  type: DocumentType;
  content?: string;
}

export interface RenderedContent {
  raw: string;
  formatted: string;
  metadata?: any;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private counter = 1;
  private documents: Document[] = [];

  constructor() {
    // Datos simulados
    this.createDocument('Reporte CD', 'PDF', '# CD\n## Dashboard\n### Perfil\n\n---\n\nalgo algo algo');
    this.createDocument('Documentación Técnica', 'Word', '## Introducción\n\nEste es un **documento importante** con `código` de ejemplo.');
    this.createDocument('Datos Análisis', 'Excel', '## Resumen Ejecutivo\n\nLos datos muestran un crecimiento del **15%** en el último trimestre.');
  }

  createDocument(name: string, type: DocumentType, content: string = ''): Document {
    const doc: Document = { id: this.counter++, name, type, content };
    this.documents.push(doc);
    return doc;
  }

  getDocuments(): Document[] {
    return this.documents;
  }

  updateDocument(id: number, newContent: string): void {
    const doc = this.documents.find(d => d.id === id);
    if (doc) {
      doc.content = newContent;
      console.log('📝 Documento actualizado:', doc.name);
    }
  }

  getDocumentById(id: number): Document | undefined {
    return this.documents.find(d => d.id === id);
  }

}
