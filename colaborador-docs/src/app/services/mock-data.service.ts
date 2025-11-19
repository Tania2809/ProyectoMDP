import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, createUser } from '../models/usuario.model';

interface Document {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockUsers: User[] = [
    createUser(1, 'Ana García', 'online'),
    createUser(2, 'Carlos Rodríguez', 'online'),
    createUser(3, 'María López', 'idle'),
    createUser(4, 'Juan Martínez', 'offline'),
    createUser(5, 'Sofia Hernández', 'online'),
  ];

  private mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Especificaciones del Proyecto',
      content: 'Documento con las especificaciones técnicas del proyecto de colaboración...',
      author: 'Ana García',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18'),
      sharedWith: ['Carlos Rodríguez', 'María López']
    },
    {
      id: 2,
      title: 'Guía de Estilos',
      content: 'Guía de estilos de la aplicación y componentes reutilizables...',
      author: 'Carlos Rodríguez',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      sharedWith: ['Ana García', 'Sofia Hernández']
    },
    {
      id: 3,
      title: 'Manual de Usuario',
      content: 'Manual completo para los usuarios finales de la aplicación...',
      author: 'María López',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
      sharedWith: ['Ana García', 'Carlos Rodríguez', 'Sofia Hernández']
    }
  ];

  private usersSubject = new BehaviorSubject<User[]>(this.mockUsers);
  private documentsSubject = new BehaviorSubject<Document[]>(this.mockDocuments);

  constructor() {
    this.initializeStatusUpdates();
  }

  /**
   * Get all mock users as Observable
   */
  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  /**
   * Get a specific user by ID
   */
  getUserById(id: number): Observable<User | undefined> {
    return this.usersSubject.pipe(
      map(users => users.find(u => u.id === id))
    );
  }

  /**
   * Update user status
   */
  updateUserStatus(userId: number, status: User['status']): void {
    const users = this.usersSubject.getValue();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      this.usersSubject.next([...users]);
    }
  }

  /**
   * Get all mock documents
   */
  getDocuments(): Observable<Document[]> {
    return this.documentsSubject.asObservable();
  }

  /**
   * Get documents shared with a specific user
   */
  getDocumentsForUser(userName: string): Observable<Document[]> {
    return this.documentsSubject.pipe(
      map(docs => docs.filter(d => 
        d.author === userName || d.sharedWith.includes(userName)
      ))
    );
  }

  /**
   * Get a specific document by ID
   */
  getDocumentById(id: number): Observable<Document | undefined> {
    return this.documentsSubject.pipe(
      map(docs => docs.find(d => d.id === id))
    );
  }

  /**
   * Create a new mock document
   */
  createDocument(title: string, content: string, author: string): Observable<Document> {
    const newDoc: Document = {
      id: Math.max(...this.mockDocuments.map(d => d.id), 0) + 1,
      title,
      content,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: []
    };
    
    this.mockDocuments.push(newDoc);
    this.documentsSubject.next([...this.mockDocuments]);
    
    return new BehaviorSubject(newDoc).asObservable();
  }

  /**
   * Update a mock document
   */
  updateDocument(id: number, updates: Partial<Document>): Observable<Document | null> {
    const docIndex = this.mockDocuments.findIndex(d => d.id === id);
    if (docIndex > -1) {
      const updated = {
        ...this.mockDocuments[docIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.mockDocuments[docIndex] = updated;
      this.documentsSubject.next([...this.mockDocuments]);
      return new BehaviorSubject(updated).asObservable();
    }
    return new BehaviorSubject<Document | null>(null).asObservable();
  }

  /**
   * Share a document with other users
   */
  shareDocument(docId: number, userNames: string[]): Observable<Document | null> {
    const doc = this.mockDocuments.find(d => d.id === docId);
    if (doc) {
      doc.sharedWith = [...new Set([...doc.sharedWith, ...userNames])];
      this.documentsSubject.next([...this.mockDocuments]);
      return new BehaviorSubject(doc).asObservable();
    }
    return new BehaviorSubject<Document | null>(null).asObservable();
  }

  /**
   * Delete a mock document
   */
  deleteDocument(id: number): Observable<boolean> {
    const docIndex = this.mockDocuments.findIndex(d => d.id === id);
    if (docIndex > -1) {
      this.mockDocuments.splice(docIndex, 1);
      this.documentsSubject.next([...this.mockDocuments]);
      return new BehaviorSubject(true).asObservable();
    }
    return new BehaviorSubject(false).asObservable();
  }

  /**
   * Initialize periodic status updates to simulate real users
   */
  private initializeStatusUpdates(): void {
    // Simulate random status changes every 10-30 seconds
    interval(15000).subscribe(() => {
      const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
      const statuses: User['status'][] = ['online', 'idle', 'offline'];
      const currentIndex = statuses.indexOf(randomUser.status || 'offline');
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      
      this.updateUserStatus(randomUser.id, nextStatus);
    });
  }

  /**
   * Reset to default mock data
   */
  resetMockData(): void {
    this.mockUsers = [
      createUser(1, 'Ana García', 'online'),
      createUser(2, 'Carlos Rodríguez', 'online'),
      createUser(3, 'María López', 'idle'),
      createUser(4, 'Juan Martínez', 'offline'),
      createUser(5, 'Sofia Hernández', 'online'),
    ];

    this.mockDocuments = [
      {
        id: 1,
        title: 'Especificaciones del Proyecto',
        content: 'Documento con las especificaciones técnicas...',
        author: 'Ana García',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18'),
        sharedWith: ['Carlos Rodríguez', 'María López']
      },
      {
        id: 2,
        title: 'Guía de Estilos',
        content: 'Guía de estilos de la aplicación...',
        author: 'Carlos Rodríguez',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20'),
        sharedWith: ['Ana García', 'Sofia Hernández']
      },
      {
        id: 3,
        title: 'Manual de Usuario',
        content: 'Manual completo para usuarios finales...',
        author: 'María López',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-19'),
        sharedWith: ['Ana García', 'Carlos Rodríguez', 'Sofia Hernández']
      }
    ];

    this.usersSubject.next([...this.mockUsers]);
    this.documentsSubject.next([...this.mockDocuments]);
  }
}