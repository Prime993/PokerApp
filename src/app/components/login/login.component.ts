import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardComponent } from '../../uicomponents/card/card.component';
import { InputFieldComponent } from '../../uicomponents/input-field/input-field.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationService } from '../../services/notification.service';
import { JiraApiService } from '../../services/jira-api.service';

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
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jiraApi: JiraApiService
  ) { }

  ngOnInit(): void {
  this.jiraApi.session().subscribe({
    next: (r) => {
      if (r.authenticated) {
        this.router.navigate(['/project-list']);
      }
    },
    error: () => {
      // Se la session non è disponibile o fallisce, restiamo nella pagina di login
    }
  });
}

  login(): void {
    this.loading = true;
    this.errorMessage = '';

    this.jiraApi.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;

        this.notificationService.showMessage({
          message: 'Login effettuato con successo!',
          type: 'success'
        });

        this.router.navigate(['/project-list']);
      },
      error: () => {
        this.loading = false;

        this.errorMessage = 'Credenziali Jira non valide';

        this.notificationService.showMessage({
          message: 'Login fallito.',
          type: 'error'
        });

        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });

  }
}
