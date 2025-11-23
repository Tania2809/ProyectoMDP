// Patrón: Mediator — Servicio central de mensajería entre componentes (registrado como singleton vía DI).
import { Injectable } from '@angular/core';

export type MediatorEvent = 'messageSent' | 'contentUpdated' | 'userJoined' | 'userLeft' | 'notification';

@Injectable({ providedIn: 'root' })
export class MediatorService {
  private components = new Map<string, any>();

  register(name: string, component: any) {
    this.components.set(name, component);
  }

  unregister(name: string) {
    this.components.delete(name);
  }

  notify(sender: string, event: MediatorEvent, data?: any) {
    // Broadcast to all registered components except the sender
    this.components.forEach((component, name) => {
      if (name === sender) return;

      // Preferred handler: onMediatorEvent(sender, event, data)
      if (typeof component.onMediatorEvent === 'function') {
        try { component.onMediatorEvent(sender, event, data); } catch (e) { console.warn(e); }
        return;
      }

      // Fallback: call method with event name if exists
      if (component && typeof component[event] === 'function') {
        try { component[event](data, sender); } catch (e) { console.warn(e); }
      }
    });
  }

  sendTo(target: string, sender: string, event: MediatorEvent, data?: any) {
    const component = this.components.get(target);
    if (!component) return;
    if (typeof component.onMediatorEvent === 'function') {
      component.onMediatorEvent(sender, event, data);
      return;
    }
    if (component && typeof component[event] === 'function') {
      component[event](data, sender);
    }
  }
}
