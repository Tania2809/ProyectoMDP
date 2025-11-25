export interface Template {
  id: string;
  name: string;
  content: string;
}

export abstract class TemplateDAO {
  abstract getAll(): Promise<Template[]>;
  abstract getById(id: string): Promise<Template | undefined>;
  abstract save(template: Omit<Template, 'id'>): Promise<Template>;
  abstract update(template: Template): Promise<Template>;
  abstract delete(id: string): Promise<void>;
}