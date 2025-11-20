import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Document, DocumentService, RenderedContent } from '../../services/documentos.service';
import { MediatorService } from '../../core/mediator/mediator.service';
import { NotificationService } from '../../core/mediator/notification.service';
import { ChatComponent } from '../../shared/components/chat/chat.component';
import { UserListComponent } from '../../shared/components/user-list/user-list.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { CollaborationMediator } from '../../core/mediator/collaboration-mediator.service';
import { UserSessionManager } from '../../core/mediator/user-session.manager';
import { User } from '../../models/usuario.model';

@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, UserListComponent, NotificationComponent],
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

  constructor(
    private documentService: DocumentService,
    private mediator: MediatorService,
    private notifications: NotificationService,
    private collaboration: CollaborationMediator,
    private sessions: UserSessionManager
  ) {}

  ngOnInit() {
    // Ensure we always have a document to work with (prevents runtime template errors)
    if (!this.document) {
      const docs = this.documentService.getDocuments();
      if (docs && docs.length) {
        this.document = docs[0];
      } else {
        this.document = this.documentService.createDocument('Untitled', 'Word', '');
      }
    }

    this.content = this.document.content || '';
    // Delay update until view is ready; small timeout is acceptable here
    setTimeout(() => this.updateDisplay(), 0);

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
    if (!this.editorRef) return;
    // Use innerText so we keep plain text for markdown processing
    this.content = this.editorRef.nativeElement.innerText || '';
    this.updateDisplay();

    // Notify that current user is typing (throttled)
    const now = Date.now();
    if (this.currentUser && (now - this.lastTypingSent) > 1500) {
      try { this.sessions.notifyTyping(this.currentUser.id); } catch (e) { }
      this.lastTypingSent = now;
    }
  }

  // Kept for compatibility if textarea remains elsewhere
  onContentChange(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.content = value;
    this.updateDisplay();
  }

  private updateDisplay() {
    // Renderizar según opciones
    let formatted = this.content;

    if (this.useSyntaxHighlight) {
      formatted = this.markdownToHtml(this.content);
    } else if (this.useTextFormat) {
      formatted = this.basicTextFormat(this.content);
    } else {
      formatted = this.escapeHtml(this.content).replace(/\n/g, '<br>');
    }

    this.displayContent = formatted;

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
    this.wordCount = words.length;
  }

  private autoSave(content: string) {
    this.documentService.updateDocument(this.document.id, content);
    // notify other components via collaboration mediator
    try { this.collaboration.contentUpdated(this.document.id, content, this.document.name); } catch (e) { }
  }

  saveDocument() {
    this.documentService.updateDocument(this.document.id, this.content);
    try { this.collaboration.contentUpdated(this.document.id, this.content, this.document.name); } catch (e) {}
    this.notifications.show(`Documento "${this.document.name}" guardado correctamente.`);
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
      if (this.editorRef) {
        this.content = this.editorRef.nativeElement.innerText;
        this.updateDisplay();
      }
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

  // Simple markdown -> HTML renderer (subset)
  private markdownToHtml(md: string): string {
    if (!md) return '';
    let formatted = this.escapeHtml(md);

    // Headers
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="md-header">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="md-header">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="md-header">$1</h1>');

    // Horizontal rules
    formatted = formatted.replace(/^---$/gim, '<hr class="md-hr">');

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');

    // Inline code
    formatted = formatted.replace(/`(.*?)`/g, '<code class="md-inline-code">$1</code>');

    // Paragraphs
    formatted = formatted.split('\n').map(line => {
      if (!line.trim() || line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || line.startsWith('<hr') || line.startsWith('<ul') || line.startsWith('<li')) {
        return line;
      }
      return `<p class="md-paragraph">${line}</p>`;
    }).join('\n');

    return formatted;
  }

  private basicTextFormat(text: string): string {
    if (!text) return '';
    return this.escapeHtml(text).split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('\n');
  }

  private escapeHtml(raw: string): string {
    return raw.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"} as any)[c]);
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
}