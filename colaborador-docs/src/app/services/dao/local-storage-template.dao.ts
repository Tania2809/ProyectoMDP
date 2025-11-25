import { Injectable } from '@angular/core';
import { Template, TemplateDAO } from './template-dao.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageTemplateDAO extends TemplateDAO {
  update(template: Template): Promise<Template> {
    throw new Error('Method not implemented.');
  }
  private readonly storageKey = 'document_templates';

  private getTemplatesFromStorage(): Template[] {
    const templatesJson = localStorage.getItem(this.storageKey);
    return templatesJson ? JSON.parse(templatesJson) : [];
  }

  private saveTemplatesToStorage(templates: Template[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
  }

  async getAll(): Promise<Template[]> {
    return this.getTemplatesFromStorage();
  }

  async getById(id: string): Promise<Template | undefined> {
    const templates = await this.getAll();
    return templates.find(t => t.id === id);
  }

  async save(templateData: Omit<Template, 'id'>): Promise<Template> {
    const templates = await this.getAll();
    const newTemplate: Template = { ...templateData, id: `template_${Date.now()}` };
    templates.push(newTemplate);
    this.saveTemplatesToStorage(templates);
    return newTemplate;
  }

  async delete(id: string): Promise<void> {
    let templates = await this.getAll();
    templates = templates.filter(t => t.id !== id);
    this.saveTemplatesToStorage(templates);
  }
}