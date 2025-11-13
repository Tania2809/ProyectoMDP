import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentService, Document, DocumentType } from '../../services/documentos.service';


@Component({
  selector: 'app-dashboard-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-personal.component.html',
  styleUrls: ['./dashboard-personal.component.scss']
  
})
export class DashboardPersonalComponent {
  documents: Document[] = [
    { id: 1, name: 'Reporte mensual', type: 'PDF' },
    { id: 2, name: 'Plan de proyecto', type: 'Word' },
    { id: 3, name: 'Inventario Q1', type: 'Excel' },
    { id: 4, name: 'Manual técnico', type: 'PDF' },
    { id: 5, name: 'Lista de precios', type: 'Excel' },
  ];

  documentTypes: DocumentType[] = ['PDF', 'Word', 'Excel'];
  selectedType: string | null = null;
  filteredDocuments: Document[] = [];
  selectedDocument: Document | null = null;

  constructor(private router: Router, private documentService: DocumentService) {}

  /** Selecciona un tipo de documento y filtra los archivos */
  selectType(type: string) {
    this.selectedType = type;
    this.filteredDocuments = this.documents.filter(d => d.type === type);
  }

  /** Agrega un nuevo documento */
  addDocumentFromInput(nameInput: HTMLInputElement, typeSelect: HTMLSelectElement) {
    const name = nameInput.value.trim();
    const type = typeSelect.value as DocumentType;

    if (!name) {
      alert('Ingrese un nombre válido');
      return;
    }

    const newDoc: Document = {
      id: this.documents.length + 1,
      name,
      type
    };

    this.documents.push(newDoc);
    if (this.selectedType === type) {
      this.selectType(this.selectedType);
    }

    nameInput.value = '';
    typeSelect.value = 'PDF';
  }

  /** Abre documento detalle */
  selectDocument(doc: Document) {
    this.selectedDocument = doc;
    this.router.navigate(['/documento', doc.id]);
  }

  
}
