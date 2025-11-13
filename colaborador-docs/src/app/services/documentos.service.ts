import { Injectable } from '@angular/core';

export type DocumentType = 'PDF' | 'Word' | 'Excel';

export interface Document {
  id: number;
  name: string;
  type: DocumentType;
  content?: string;
}

// Interfaz del Editor
export interface Editor {
  render(content: string): RenderedContent;
  getFeatures(): string[];
}

export interface RenderedContent {
  raw: string;
  formatted: string;
  metadata?: any;
}

/* Editor base */
export class BasicEditor implements Editor {
  render(content: string): RenderedContent {
    return {
      raw: content,
      formatted: content
    };
  }

  getFeatures(): string[] {
    return ['Editor básico'];
  }
}

/* Clase base Decorator */
export class EditorDecorator implements Editor {
  constructor(protected editor: Editor) {}

  render(content: string): RenderedContent {
    return this.editor.render(content);
  }

  getFeatures(): string[] {
    return this.editor.getFeatures();
  }
}

/* Decorador 1: Contador de palabras */
export class WordCountDecorator extends EditorDecorator {
  override render(content: string): RenderedContent {
    const rendered = super.render(content);
    const wordCount = content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
    
    return {
      ...rendered,
      metadata: {
        ...rendered.metadata,
        wordCount
      }
    };
  }

  override getFeatures(): string[] {
    return [...super.getFeatures(), 'Contador de palabras'];
  }
}

/* Decorador 2: Resaltado de sintaxis Markdown */
export class SyntaxHighlightDecorator extends EditorDecorator {
  override render(content: string): RenderedContent {
    const rendered = super.render(content);
    
    // Procesar Markdown básico
    let formatted = content;
    
    // Encabezados
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="md-header">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="md-header">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="md-header">$1</h1>');
    
    // Líneas horizontales
    formatted = formatted.replace(/^---$/gim, '<hr class="md-hr">');
    
    // Negrita
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');
    
    // Código en línea
    formatted = formatted.replace(/`(.*?)`/g, '<code class="md-inline-code">$1</code>');
    
    // Párrafos (agregar <p> a líneas que no son elementos de bloque)
    formatted = formatted.split('\n').map(line => {
      if (!line.trim() || 
          line.startsWith('<h1') || 
          line.startsWith('<h2') || 
          line.startsWith('<h3') || 
          line.startsWith('<hr') ||
          line.startsWith('<ul') ||
          line.startsWith('<li')) {
        return line;
      }
      return `<p class="md-paragraph">${line}</p>`;
    }).join('\n');

    return {
      ...rendered,
      formatted
    };
  }

  override getFeatures(): string[] {
    return [...super.getFeatures(), 'Resaltado Markdown'];
  }
}

/* Decorador 3: Guardado automático */
export class AutoSaveDecorator extends EditorDecorator {
  private lastContent: string = '';
  private autoSaveInterval: any;

  constructor(editor: Editor, private saveCallback: (content: string) => void) {
    super(editor);
  }

  override render(content: string): RenderedContent {
    const rendered = super.render(content);
    
    if (content !== this.lastContent) {
      this.lastContent = content;
      this.triggerAutoSave(content);
    }
    
    return rendered;
  }

  private triggerAutoSave(content: string): void {
    if (this.autoSaveInterval) {
      clearTimeout(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setTimeout(() => {
      this.saveCallback(content);
      console.log('💾 Documento guardado automáticamente');
    }, 2000);
  }

  override getFeatures(): string[] {
    return [...super.getFeatures(), 'Guardado automático'];
  }
}

/* Decorador 4: Formato básico de texto */
export class TextFormatDecorator extends EditorDecorator {
  override render(content: string): RenderedContent {
    const rendered = super.render(content);
    
    let formatted = rendered.formatted;
    
    // Aplicar formato básico si no hay Markdown
    if (!formatted.includes('md-')) {
      // Líneas que parecen encabezados
      formatted = formatted.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          return line; // Dejar que Markdown lo procese
        }
        if (trimmed.length > 50 && !trimmed.startsWith('<')) {
          return `<p>${line}</p>`;
        }
        return line;
      }).join('\n');
    }

    return {
      ...rendered,
      formatted
    };
  }

  override getFeatures(): string[] {
    return [...super.getFeatures(), 'Formato de texto'];
  }
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private counter = 1;
  private documents: Document[] = [];

  constructor() {
    // Datos simulados con contenido Markdown
    this.createDocument('Reporte CD', 'PDF', '# CD\n## Dashboard\n### Perfil\n\n---\n\nalgo algo algo algo algo algo algo');
    this.createDocument('Documentación Técnica', 'Word', '## Introducción\n\nEste es un **documento importante** con `código` de ejemplo.\n\n---\n\n### Características\n\n- Característica 1\n- Característica 2');
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