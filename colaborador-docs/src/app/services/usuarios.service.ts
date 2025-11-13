import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor() { }
}


export class CollaborationMediator {
  private components: any = {};

  register(name: string, component: any) {
    this.components[name] = component;
    component.setMediator(this);
  }

  notify(sender: string, event: string, data?: any) {
    switch (event) {
      case 'messageSent':
        this.components['Notification'].show(`Nuevo mensaje de ${sender}`);
        this.components['Chat'].displayMessage(sender, data);
        break;
      case 'contentUpdated':
        this.components['Editor'].syncContent(data);
        break;
    }
  }
}

// Componente
export class ChatComponent {
  private mediator!: CollaborationMediator;
  setMediator(mediator: CollaborationMediator) {
    this.mediator = mediator;
  }

  sendMessage(user: string, message: string) {
    this.mediator.notify(user, 'messageSent', message);
  }

  displayMessage(user: string, message: string) {
    console.log(`${user}: ${message}`);
  }
}
