/**
 * Interfaz Componente (en la terminología del patrón Decorator)
 * Define la interfaz común para los objetos que pueden ser decorados.
 */
export interface IFeatureRichDocument {
  getFeatures(): string[];
  getContent(): string;
}

/**
 * Componente Concreto
 * La clase base que implementa la interfaz. Será el objeto inicial que envolveremos.
 */
export class BaseDocument implements IFeatureRichDocument {
  constructor(private content: string) {}

  public getFeatures(): string[] {
    return ['Edición de texto básica'];
  }

  public getContent(): string {
    return this.content;
  }
}

/**
 * Decorador Base (Abstracto)
 * Mantiene una referencia al objeto Componente que envuelve y delega las llamadas a él.
 */
export abstract class DocumentDecorator implements IFeatureRichDocument {
  protected wrappedDocument: IFeatureRichDocument;

  constructor(doc: IFeatureRichDocument) {
    this.wrappedDocument = doc;
  }

  // Delega la llamada al objeto envuelto
  public getContent(): string {
    return this.wrappedDocument.getContent();
  }

  /**
   * Este es el método que los decoradores concretos extenderán para añadir
   * su propia funcionalidad.
   */
  public abstract getFeatures(): string[];
}