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
  useTextFormat: boolean = true;

  // Estado de los botones de formato
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  alignment: 'left' | 'center' | 'right' = 'left';

  // editor field removed; logic is implemented directly in the component

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
    // Establecer el contenido inicial y actualizar el estado una vez.
    // Usamos setTimeout para asegurarnos de que el editorRef esté disponible.
    setTimeout(() => this.updateEditorState(true), 0);
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
    // Solo actualizamos el modelo y los contadores, sin volver a renderizar el [innerHTML].
    this.updateEditorState(false);

    // --- SOLUCIÓN: Enviar evento 'typing' de forma controlada ---
    // Solo envía el evento si han pasado más de 3 segundos desde la última vez.
    const now = Date.now();
    if (this.currentUser && now - this.lastTypingSent > 7000) {
      this.sessions.sendEvent({ type: 'typing', user: this.currentUser });
      this.lastTypingSent = now;
    }
  }

  /**
   * Actualiza el estado del componente basado en el contenido del editor.
   * @param setDisplayContent Si es true, actualiza el displayContent para el renderizado inicial.
   */
  private updateEditorState(setDisplayContent: boolean) {
    this.content = this.editorRef.nativeElement.innerHTML;
    if (setDisplayContent) {
      this.displayContent = this.content;
    }
    // Actualizar contador de palabras
    this.updateWordCount();
  }

  private updateWordCount() {
    const words = this.content.trim().length > 0 ? this.content.trim().split(/\s+/) : [];
    this.wordCount = this.editorRef?.nativeElement.innerText.trim().split(/\s+/).filter(Boolean).length || 0;
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
    this.initializeDocument(saved); // Re-inicializar con el nuevo contenido
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
      // Forzar la actualización del contenido después de aplicar el formato.
      this.onEditorInput();
    } catch (e) {
      console.warn('execCommand no soportado en este entorno', e);
    }
  }

  // Toggle de características
  toggleWordCount() {
    this.useWordCount = !this.useWordCount;
    this.updateWordCount(); // Solo actualiza el contador, no toda la vista
  }

  toggleSyntaxHighlight() {
    this.useSyntaxHighlight = !this.useSyntaxHighlight;
    // No es necesario hacer nada aquí si no se vuelve a renderizar
  }

  toggleTextFormat() {
    this.useTextFormat = !this.useTextFormat;
    // No es necesario hacer nada aquí si no se vuelve a renderizar
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