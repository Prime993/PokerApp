import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" class="notification" [ngClass]="notification.type">
      {{ notification.message }}
    </div>
  `,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notification: NotificationData | null = null;

  constructor(private notificationService: NotificationService) {
    this.notificationService.message$.subscribe(message => {
      this.notification = message;
    });
  }
}