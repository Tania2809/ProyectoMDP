import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Document, DocumentType } from '../../services/documentos.service';
import { DocumentFacade } from '../../services/document-facade.service';
import { MarkdownRenderer, SyntaxHighlighterDecorator } from '../../services/renderer.service';
@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documento-detalle.component.html',
  styleUrls: ['./documento-detalle.component.scss']
})
export class DocumentoDetalleComponent implements OnInit, OnChanges {
  @Input() documentInput?: Document;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Document>();

  document!: Document;
  documentTypes: DocumentType[] = ['PDF', 'Word', 'Excel'];
  safeHtml: SafeHtml | string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facade: DocumentFacade,
    private markdownRenderer: MarkdownRenderer,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Si se pasa el documento como input (modo modal), lo usamos directamente
    if (this.documentInput) {
      this.document = this.documentInput;
      this.renderPreview();
      return;
    }

    // Si no se pasa input, soportar la ruta tradicional (compatibilidad hacia atrás)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.facade.getDocumentById(id).subscribe(foundDoc => {
      if (foundDoc) {
        this.document = foundDoc;
        this.renderPreview();
      } else {
        alert('Documento no encontrado');
        this.router.navigate(['/']);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentInput'] && this.documentInput) {
      this.document = this.documentInput as Document;
      this.renderPreview();
    }
  }

  saveChanges() {
    this.facade.saveDocument(this.document).subscribe(res => {
      if (res) {
        this.document = res as Document;
        this.renderPreview();
        // Emitir evento para el padre (modal)
        this.saved.emit(this.document);
      } else {
        alert('Error al guardar');
      }
    });
  }

  cancel() {
    // En modo modal, informar al padre; en modo ruta, volver
    if (this.documentInput) {
      this.closed.emit();
    } else {
      this.router.navigate(['/']);
    }
  }

  private renderPreview() {
    if (!this.document) {
      this.safeHtml = '';
      return;
    }

    const decorator = new SyntaxHighlighterDecorator(this.markdownRenderer);
    const html = decorator.render(this.document);
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
