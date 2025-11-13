import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Document, 
  DocumentService, 
  Editor, 
  BasicEditor, 
  WordCountDecorator, 
  SyntaxHighlightDecorator, 
  AutoSaveDecorator,
  TextFormatDecorator,
  RenderedContent
} from '../../services/documentos.service';

@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss']
})
export class DocumentosComponent implements OnInit, OnDestroy {
  @Input() document!: Document;

  content: string = '';
  displayContent: string = '';
  wordCount: number = 0;
  features: string[] = [];
  
  // Configuración de decoradores
  useWordCount: boolean = true;
  useSyntaxHighlight: boolean = true;
  useAutoSave: boolean = true;
  useTextFormat: boolean = true;

  // Estado de los botones de formato
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  alignment: 'left' | 'center' | 'right' = 'left';

  private editor: Editor;

  constructor(private documentService: DocumentService) {
    this.editor = this.buildEditor();
  }

  ngOnInit() {
    if (this.document) {
      this.content = this.document.content || '';
      this.updateDisplay();
    }
  }

  ngOnDestroy() {
    // Limpiar intervalos si es necesario
  }

  private buildEditor(): Editor {
    let editor: Editor = new BasicEditor();

    if (this.useWordCount) {
      editor = new WordCountDecorator(editor);
    }

    if (this.useSyntaxHighlight) {
      editor = new SyntaxHighlightDecorator(editor);
    }

    if (this.useAutoSave) {
      editor = new AutoSaveDecorator(editor, (content: string) => {
        this.autoSave(content);
      });
    }

    if (this.useTextFormat) {
      editor = new TextFormatDecorator(editor);
    }

    this.features = editor.getFeatures();
    return editor;
  }

  onContentChange(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.content = value;
    this.updateDisplay();
  }

  private updateDisplay() {
    const rendered: RenderedContent = this.editor.render(this.content);
    this.displayContent = rendered.formatted;
    
    // Actualizar contador de palabras
    if (rendered.metadata?.wordCount !== undefined) {
      this.wordCount = rendered.metadata.wordCount;
    } else {
      this.updateWordCount();
    }
  }

  private updateWordCount() {
    const words = this.content.trim().split(/\s+/);
    this.wordCount = this.content.trim().length > 0 ? words.length : 0;
  }

  private autoSave(content: string) {
    this.documentService.updateDocument(this.document.id, content);
  }

  saveDocument() {
    this.documentService.updateDocument(this.document.id, this.content);
    alert(`Documento "${this.document.name}" guardado correctamente.`);
  }

  // Métodos para los botones de formato
  toggleBold() {
    this.isBold = !this.isBold;
    this.applyFormatting();
  }

  toggleItalic() {
    this.isItalic = !this.isItalic;
    this.applyFormatting();
  }

  toggleUnderline() {
    this.isUnderline = !this.isUnderline;
    this.applyFormatting();
  }

  setAlignment(align: 'left' | 'center' | 'right') {
    this.alignment = align;
    this.applyFormatting();
  }

  private applyFormatting() {
    // Aquí iría la lógica para aplicar formato al texto seleccionado
    // Por ahora, solo actualizamos la visualización
    console.log('Aplicando formato:', {
      bold: this.isBold,
      italic: this.isItalic,
      underline: this.isUnderline,
      alignment: this.alignment
    });
  }

  // Toggle de características
  toggleWordCount() {
    this.useWordCount = !this.useWordCount;
    this.rebuildEditor();
  }

  toggleSyntaxHighlight() {
    this.useSyntaxHighlight = !this.useSyntaxHighlight;
    this.rebuildEditor();
  }

  toggleTextFormat() {
    this.useTextFormat = !this.useTextFormat;
    this.rebuildEditor();
  }

  toggleAutoSave() {
    this.useAutoSave = !this.useAutoSave;
    this.rebuildEditor();
  }

  private rebuildEditor() {
    this.editor = this.buildEditor();
    this.updateDisplay();
  }
}