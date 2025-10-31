import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageSource = new BehaviorSubject<NotificationData | null>(null);
  message$ = this.messageSource.asObservable();

  showMessage(message: NotificationData) {
    this.messageSource.next(message);

    // opzionale: nasconde la notifica dopo 3 secondi
    setTimeout(() => this.messageSource.next(null), 3000);
  }
}
