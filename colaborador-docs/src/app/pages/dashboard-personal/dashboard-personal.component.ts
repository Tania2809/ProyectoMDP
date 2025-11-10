import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService, Document, DocumentType } from '../../services/documentos.service';

@Component({
  selector: 'app-dashboard-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-personal.component.html',
  styleUrls: ['./dashboard-personal.component.scss']
})

export class DashboardPersonalComponent {
  documents: Document[] = [];
  stats: any[] = [];

  selectedDocument: Document | null = null;

// Método para seleccionar un documento
selectDocument(doc: Document) {
  this.selectedDocument = doc;
}

  constructor(private documentService: DocumentService) {
    // Obtener documentos iniciales desde el servicio
    this.documents = this.documentService.getDocuments();
    this.updateStats();
  }

addDocumentFromInput(nameInput: HTMLInputElement, typeSelect: HTMLSelectElement) {
  const name = nameInput.value.trim();
  const type = typeSelect.value as DocumentType;

  if (!name) {
    alert('Ingrese un nombre válido');
    return;
  }

  this.addDocument(name, type);

  // Limpiar input
  nameInput.value = '';
  typeSelect.value = 'PDF'; 
}

  addDocument(name: string, type: DocumentType) {
    this.documentService.createDocument(name, type);
    // Actualizar lista local desde el servicio
    this.documents = this.documentService.getDocuments();
    this.updateStats();
  }

updateStats() {
  this.stats = [
    { 
      title: 'PDF', 
      documents: this.documents.filter(d => d.type === 'PDF') 
    },
    { 
      title: 'Word', 
      documents: this.documents.filter(d => d.type === 'Word') 
    },
    { 
      title: 'Excel', 
      documents: this.documents.filter(d => d.type === 'Excel') 
    },
  ];
}

}
