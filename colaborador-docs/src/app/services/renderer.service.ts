// Patrón: Decorator — Implementa Renderer y decoradores (p. ej. SyntaxHighlighterDecorator) para enriquecer renderizado.
import { Injectable } from '@angular/core';
import { Document } from './documentos.service';

export interface Renderer {
  render(document: Document): string;
}

@Injectable({ providedIn: 'root' })
export class MarkdownRenderer implements Renderer {
  render(document: Document): string {
    const text = document.content || '';

    const lines = text.split(/\r?\n/).map(l => {
      if (/^###\s+/.test(l)) return `<h3>${this.escapeHtml(l.replace(/^###\s+/, ''))}</h3>`;
      if (/^##\s+/.test(l)) return `<h2>${this.escapeHtml(l.replace(/^##\s+/, ''))}</h2>`;
      if (/^#\s+/.test(l)) return `<h1>${this.escapeHtml(l.replace(/^#\s+/, ''))}</h1>`;
      // bold **text** and inline `code`
      let p = this.escapeHtml(l)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      return `<p>${p}</p>`;
    }).join('');

    return lines;
  }

  private escapeHtml(input: string) {
    return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// Decorator implementation: not injectable (constructed manually)
export class RendererDecorator implements Renderer {
  constructor(protected wrapped: Renderer) {}
  render(document: Document): string {
    return this.wrapped.render(document);
  }
}

export class SyntaxHighlighterDecorator extends RendererDecorator {
  override render(document: Document): string {
    let html = super.render(document);
    // Simple highlighting: wrap inline code with a span class for styling
    html = html.replace(/<code>([\s\S]*?)<\/code>/g, '<code class="hl">$1</code>');
    return html;
  }
}
