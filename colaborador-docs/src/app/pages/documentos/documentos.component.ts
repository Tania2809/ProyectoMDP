// Patrón: Mediator (vista principal) — Usa Mediator para coordinar eventos entre editor, chat y notificaciones; también integra Observer (UserSessionManager) y Facade (DocumentFacade).
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Document, RenderedContent } from '../../services/documentos.service';
import { MediatorService } from '../../core/mediator/mediator.service';
import { NotificationService } from '../../core/mediator/notification.service';
import { ChatComponent } from '../../shared/components/chat/chat.component';
import { UserListComponent } from '../../shared/components/user-list/user-list.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { DocumentoDetalleComponent } from '../documento-detalle/documento-detalle.component';
import { CollaborationMediator } from '../../core/mediator/collaboration-mediator.service';
import { DocumentFacade } from '../../services/document-facade.service';
import { UserSessionManager } from '../../core/mediator/user-session.manager';
import { User } from '../../models/usuario.model';
import { Template } from '../../services/dao/template-dao.model';
import { LocalStorageTemplateDAO } from '../../services/dao/local-storage-template.dao';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, UserListComponent, NotificationComponent, DocumentoDetalleComponent, SafeHtmlPipe, AsyncPipe],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss']
})
export class DocumentosComponent implements OnInit, OnDestroy {
  @Input() document!: Document;

  @ViewChild('editor', { static: false }) editorRef!: ElementRef<HTMLDivElement>;

  content: string = '';
  displayContent: string = '';
  wordCount: number = 0;
  features: string[] = [];
  
  // Características disponibles
  useWordCount: boolean = true;
  useSyntaxHighlight: boolean = true;
  useAutoSave: boolean = true;
  useTextFormat: boolean = true;

  // Estado de los botones de formato
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  alignment: 'left' | 'center' | 'right' = 'left';

  // editor field removed; logic is implemented directly in the component
  private autoSaveTimer: any = null;

  // Editing indicator state
  editingBy?: { name: string; color: string; expiresAt: number };
  private editingTimer: any = null;
  private usersSub: any = null;
  private eventsSub: any = null;
  private currentUser?: User;
  private lastTypingSent = 0;
  // Modal state para mostrar detalle en overlay
  modalOpen: boolean = false;
  modalDocument?: Document;
  // DAO Pattern for templates
  templates: Promise<Template[]> = Promise.resolve([]);

  constructor(
    private mediator: MediatorService,
    private notifications: NotificationService,
    private collaboration: CollaborationMediator,
    private sessions: UserSessionManager,
    private facade: DocumentFacade,
    // Inyectamos el DAO directamente. En una app más grande, podría ir tras una Facade.
    private templateDAO: LocalStorageTemplateDAO,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.document) {
      this.facade.getAllDocuments().subscribe(docs => {
        // Si se obtienen documentos, inicializa con el primero.
        if (docs && docs.length) {
          this.initializeDocument(docs[0]);
        }
      },
      error => {
        // Si la API falla (p. ej. 404), crea un documento local temporal para que la UI funcione.
        console.error('Error al obtener documentos. Usando un documento local temporal.', error);
        this.initializeDocument({ name: 'Documento Offline', type: 'Word', content: 'No se pudo conectar con el servidor.' } as Document);
      }
    );
    } else {
      this.initializeDocument(this.document);
    }

    // Register in mediator
    try { this.mediator.register('Editor', this); } catch (e) { /* noop */ }

    // Subscribe to session users and events to track typing from others
    this.usersSub = this.sessions.users$().subscribe(users => {
      // pick a default current user for this client (first user in list) if not set
      if (!this.currentUser && users && users.length) {
        this.currentUser = users[0];
      }
    });

    this.eventsSub = this.sessions.events$().subscribe(ev => {
      if (!ev) return;
      if (ev.type === 'typing') {
        // ignore if it's from current user
        if (this.currentUser && ev.user && ev.user.id === this.currentUser.id) return;
        this.showEditingIndicator(ev.user.name, this.pickColor(ev.user.id));
      }
    });

    // Cargar plantillas usando el DAO
    this.loadTemplates();
  }

  private initializeDocument(doc: Document) {
    this.document = doc;
    this.content = this.document.content || '';
    // Delay update until view is ready; small timeout is acceptable here
    setTimeout(() => this.updateDisplay(), 0);
  }

  ngOnDestroy() {
    // Limpiar intervalos si es necesario
    try { this.mediator.unregister('Editor'); } catch (e) { /* noop */ }
    this.usersSub?.unsubscribe?.();
    this.eventsSub?.unsubscribe?.();
    if (this.editingTimer) clearTimeout(this.editingTimer);
  }

  // Input handler for the contenteditable editor
  onEditorInput() {
    if (!this.editorRef?.nativeElement) return;
    // Usar innerHTML para preservar el formato de texto enriquecido (negrita, etc.)
    this.content = this.editorRef.nativeElement.innerHTML;
    this.updateDisplay();

    // Notify that current user is typing (throttled)
    const now = Date.now();
    if (this.currentUser && (now - this.lastTypingSent) > 1500) {
      try { this.sessions.notifyTyping(this.currentUser.id); } catch (e) { }
      this.lastTypingSent = now;
    }
  }

  // Kept for compatibility if textarea remains elsewhere
  // onContentChange(event: Event) {
  //   const value = (event.target as HTMLTextAreaElement).value;
  //   this.content = value;
  //   this.updateDisplay();
  // }

  private updateDisplay() {
    // El contenido ya es HTML gracias a contenteditable, no se necesita procesamiento adicional.
    // Simplemente actualizamos los contadores y programamos el autoguardado.
    this.displayContent = this.content;

    // Actualizar contador de palabras
    if (this.useWordCount) {
      this.updateWordCount();
    } else {
      this.wordCount = 0;
    }

    // Trigger autosave
    if (this.useAutoSave) {
      this.scheduleAutoSave();
    }
  }

  private updateWordCount() {
    const words = this.content.trim().length > 0 ? this.content.trim().split(/\s+/) : [];
    this.wordCount = this.editorRef?.nativeElement.innerText.trim().split(/\s+/).filter(Boolean).length || 0;
  }

  private autoSave(content: string) {
    if (!this.document) return; // Evita errores si el documento no está inicializado
    this.document.content = content;
    this.facade.saveDocument(this.document).subscribe(() => {
      try { this.collaboration.contentUpdated(this.document.id, content, this.document.name); } catch (e) { }
    });
  }

  saveDocument() {
    if (!this.document) return; // Guarda para prevenir errores si el documento no está listo
    this.document.content = this.content;
    this.facade.saveDocument(this.document).subscribe(() => {
      try { this.collaboration.contentUpdated(this.document.id, this.content, this.document.name); } catch (e) {}
      this.notifications.show(`Documento "${this.document.name}" guardado correctamente.`);
    });
  }


  openDetailView() {
    if (this.document && (this.document as any).id) {
      // Abrir modal en lugar de navegar
      this.modalDocument = this.document;
      this.modalOpen = true;
    }
  }

  closeModal() {
    this.modalOpen = false;
    this.modalDocument = undefined;
  }

  onModalSaved(saved: Document) {
    // Actualizar el documento local y la vista
    this.document = saved;
    this.content = saved.content || '';
    this.updateDisplay();
    try { this.collaboration.contentUpdated(this.document.id, this.content, this.document.name); } catch (e) {}
    this.notifications.show(`Documento "${this.document.name}" guardado correctamente.`);
    this.closeModal();
  }

  // Métodos para los botones de formato
  toggleBold() {
    this.execCommand('bold');
  }

  toggleItalic() {
    this.execCommand('italic');
  }

  toggleUnderline() {
    this.execCommand('underline');
  }

  setAlignment(align: 'left' | 'center' | 'right') {
    this.execCommand(align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight');
    this.alignment = align;
  }

  private execCommand(command: string) {
    // Ensure focus in editor
    if (this.editorRef && this.editorRef.nativeElement) {
      this.editorRef.nativeElement.focus();
    }
    try {
      document.execCommand(command as any, false);
      // Update content after formatting
      // if (this.editorRef) {
      //   this.content = this.editorRef.nativeElement.innerText;
      //   this.updateDisplay();
      // }
    } catch (e) {
      console.warn('execCommand no soportado en este entorno', e);
    }
  }

  // Toggle de características
  toggleWordCount() {
    this.useWordCount = !this.useWordCount;
    this.updateDisplay();
  }

  toggleSyntaxHighlight() {
    this.useSyntaxHighlight = !this.useSyntaxHighlight;
    this.updateDisplay();
  }

  toggleTextFormat() {
    this.useTextFormat = !this.useTextFormat;
    this.updateDisplay();
  }

  toggleAutoSave() {
    this.useAutoSave = !this.useAutoSave;
    if (!this.useAutoSave && this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.updateDisplay();
  }

  private scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave(this.content);
    }, 1500);
  }

  // Handler called by MediatorService
  onMediatorEvent(sender: string, event: string, data?: any) {
    if (event === 'messageSent') {
      // show a small notification
      this.notifications.show(`Mensaje de ${data?.user}: ${data?.message}`);
    }
    if (event === 'notification') {
      this.notifications.show(data?.text || 'Notificación');
    }

    // Optionally react to contentUpdated coming from mediator (may be used in other clients)
    if (event === 'contentUpdated') {
      // if someone else updated content, show a brief editing indicator
      const author = data?.author || data?.authorName || 'Alguien';
      // ignore if event seems to be originated by this client (best-effort)
      if (this.currentUser && author === this.currentUser.name) return;
      this.showEditingIndicator(author, this.pickColor(author.length));
    }
  }

  // Show a small editing indicator when another user is editing
  private showEditingIndicator(name: string, color: string, duration = 3000) {
    this.editingBy = { name, color, expiresAt: Date.now() + duration };
    if (this.editingTimer) clearTimeout(this.editingTimer);
    this.editingTimer = setTimeout(() => {
      this.editingBy = undefined;
      this.editingTimer = null;
    }, duration);
  }

  // Simple deterministic color picker based on a seed
  private pickColor(seed: number | string): string {
    const palette = ['#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
    let s = 0;
    const str = typeof seed === 'number' ? String(seed) : String(seed || '');
    for (let i = 0; i < str.length; i++) s = (s << 5) - s + str.charCodeAt(i);
    s = Math.abs(s);
    return palette[s % palette.length];
  }

  // --- Funcionalidad de Plantillas con Patrón DAO ---

  private loadTemplates() {
    this.templates = this.templateDAO.getAll();
  }

  async applyTemplate(templateId: string) {
    const template = await this.templateDAO.getById(templateId);
    if (template && this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.innerHTML = template.content;
      this.onEditorInput(); // Actualizar estado del componente
      this.notifications.show(`Plantilla "${template.name}" aplicada.`);
    }
  }

  async saveAsTemplate() {
    const name = prompt('Ingresa un nombre para la plantilla:', 'Mi Plantilla');
    if (name && this.content.trim()) {
      await this.templateDAO.save({ name, content: this.content });
      this.notifications.show(`Plantilla "${name}" guardada localmente.`);
      this.loadTemplates(); // Recargar la lista de plantillas
    }
  }

}