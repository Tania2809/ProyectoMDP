import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService, Document } from '../../services/mock-data.service'; // Importamos el servicio correcto
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-personal.component.html',
  styleUrls: ['./dashboard-personal.component.scss'],
})
export class DashboardPersonalComponent implements OnInit {
  documents$: Observable<Document[]>; // Usamos un Observable para los documentos
  allDocuments: Document[] = []; // Almacenamos todos los documentos aquí

  documentTypes: string[] = ['PDF', 'Word', 'Excel', 'Texto']; // Tipos de documentos disponibles
  selectedType: string | null = null; // Tipo de documento actualmente seleccionado para filtrar
  filteredDocuments: Document[] = [];
  selectedDocument: Document | null = null;

  constructor(
    private router: Router,
    private mockDataService: MockDataService // Inyectamos el servicio de datos real
  ) {
    this.documents$ = this.mockDataService.getDocuments();
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  /** Carga los documentos desde el backend */
  loadDocuments(): void {
    this.documents$.subscribe(docs => {
      this.allDocuments = docs;
      // Si hay un tipo seleccionado, aplicamos el filtro, si no, mostramos todos
      if (this.selectedType) {
        this.selectType(this.selectedType);
      } else {
        this.filteredDocuments = this.allDocuments;
      }
    });
  }

  /** Selecciona un tipo de documento y filtra la lista */
  selectType(type: string | null) {
    this.selectedType = type;
    this.filteredDocuments = type ? this.allDocuments.filter(d => d.type === type) : this.allDocuments;
  }

  /** Agrega un nuevo documento */
  addDocumentFromInput(nameInput: HTMLInputElement, typeSelect: HTMLSelectElement) {
    const title = nameInput.value.trim();
    const type = typeSelect.value;

    if (!title) {
      alert('Ingrese un nombre válido');
      return;
    }

    // El autor debería obtenerse del usuario logueado, pero por ahora usamos un valor fijo.
    const author = 'Usuario Actual';
    const content = `Contenido inicial para ${title}`;

    this.mockDataService.createDocument(title, content, author, type).subscribe({
      next: () => {
        // En lugar de solo llamar a loadDocuments(), obtenemos la lista actualizada
        // y nos aseguramos de que el filtro se aplique correctamente.
        this.mockDataService.getDocuments().subscribe(docs => {
          this.allDocuments = docs;
          this.selectType(this.selectedType); // Re-aplicamos el filtro actual
        });
      },
      error: (err) => console.error('Error al crear el documento:', err)
    });

    nameInput.value = ''; // Limpiamos el input
    typeSelect.value = this.documentTypes[0]; // Reseteamos el select
  }

  /** Inicia la edición de un documento */
  editDocument(doc: Document) {
    // Usamos un prompt simple para obtener el nuevo título
    const newTitle = prompt('Ingrese el nuevo nombre para el documento:', doc.title);

    if (newTitle && newTitle.trim() !== '' && newTitle.trim() !== doc.title) {
      this.mockDataService.updateDocument(doc._id, newTitle.trim(), doc.content).subscribe({
        next: () => {
          this.loadDocuments(); // Recargamos la lista para ver el cambio
        },
        error: (err) => console.error('Error al actualizar el documento:', err)
      });
    }
  }

  /** Elimina un documento */
  deleteDocument(doc: Document) {
    // Pedimos confirmación antes de borrar
    const confirmation = confirm(`¿Está seguro de que desea eliminar el documento "${doc.title}"?`);

    if (confirmation) {
      this.mockDataService.deleteDocument(doc._id).subscribe({
        next: () => {
          this.loadDocuments(); // Recargamos la lista
        },
        error: (err) => console.error('Error al eliminar el documento:', err)
      });
    }
  }

  /** Abre documento detalle */
  selectDocument(doc: Document) {
    this.selectedDocument = doc;
    this.router.navigate(['/documento', doc._id]); // Usamos _id de MongoDB
  }
}
