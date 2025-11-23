import { DocumentDecorator, IFeatureRichDocument } from "./document.decorator";

/**
 * Decorador Concreto 1: Añade la funcionalidad de Revisión Ortográfica.
 */
export class SpellCheckDecorator extends DocumentDecorator {
  constructor(doc: IFeatureRichDocument) {
    super(doc);
  }

  public getFeatures(): string[] {
    // Llama al método del objeto envuelto y añade su propia característica
    return [...this.wrappedDocument.getFeatures(), '✅ Revisión Ortográfica'];
  }
}

/**
 * Decorador Concreto 2: Añade la funcionalidad de Comentarios.
 */
export class CommentingDecorator extends DocumentDecorator {
  constructor(doc: IFeatureRichDocument) {
    super(doc);
  }

  public getFeatures(): string[] {
    // Llama al método del objeto envuelto y añade su propia característica
    return [...this.wrappedDocument.getFeatures(), '💬 Modo Comentarios'];
  }
}