import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardComponent } from '../../uicomponents/card/card.component';
import { InputFieldComponent } from '../../uicomponents/input-field/input-field.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  login(): void {
    this.loading = true;
    this.errorMessage = '';

    // Simula una chiamata asincrona di login
    setTimeout(() => {
      this.loading = false;

      const isValidUser = this.email === 'admin' && this.password === '1234';

      if (isValidUser) {
        localStorage.setItem('isAuthenticated', 'true');

        this.notificationService.showMessage({
          message: 'Login effettuato con successo!',
          type: 'success'
        });

        this.router.navigate(['/project-list']);
      } else {
        this.errorMessage = 'Credenziali errate';
        this.notificationService.showMessage({
          message: 'Credenziali errate, riprova.',
          type: 'error'
        });

        // Cancella il messaggio d’errore dopo 3 secondi
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    }, 1000);
  }
}
