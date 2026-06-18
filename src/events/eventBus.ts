import { EventEmitter } from 'node:events';
import { AgreementEvent } from '../types/event.types';

export const eventBus = new EventEmitter();

export const publishEvent = (eventName: string, eventData: AgreementEvent) => {
  eventBus.emit(eventName, eventData);
};

export const subscribeToEvent = (eventName: string, callback: (eventData: AgreementEvent) => void) => {
  eventBus.on(eventName, callback);
};
