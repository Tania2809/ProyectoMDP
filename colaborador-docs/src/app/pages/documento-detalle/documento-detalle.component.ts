import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentService, Document, DocumentType } from '../../services/documentos.service';
@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documento-detalle.component.html',
  styleUrls: ['./documento-detalle.component.scss']
})
export class DocumentoDetalleComponent {
  document!: Document;
  documentTypes: DocumentType[] = ['PDF', 'Word', 'Excel'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const foundDoc = this.documentService.getDocuments().find(d => d.id === id);
    if (foundDoc) {
      // Clonar para evitar modificar el original directamente
      this.document = { ...foundDoc };
    } else {
      alert('Documento no encontrado');
      this.router.navigate(['/']);
    }
  }

  saveChanges() {
    // Guardar cambios en el servicio
    const docs = this.documentService.getDocuments();
    const index = docs.findIndex(d => d.id === this.document.id);
    if (index !== -1) {
      docs[index] = this.document;
      alert('Cambios guardados correctamente');
    }
    this.router.navigate(['/']);
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
