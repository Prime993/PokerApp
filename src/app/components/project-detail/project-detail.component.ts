import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { CardComponent } from '../../uicomponents/card/card.component';
import { InputFieldComponent } from '../../uicomponents/input-field/input-field.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputFieldComponent, ButtonComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectId!: string;
  projectName: string = '';
  storyPointsInput: string = '';
  storyPoints: number = 0;

  tasks: any[] = [];
  isLoading = false;
  hasSearched = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.projectName = state?.name || `Progetto ${this.projectId}`;
  }

  goToProjectList(): void {
    this.router.navigate(['/project-list']);
  }

  onSearch() {
    const trimmed = this.storyPointsInput.trim();

    if (trimmed === '') {
      this.storyPoints = 0;
    } else if (isNaN(Number(trimmed))) {
      this.notificationService.showMessage({
        message: 'Inserisci un valore numerico valido per gli story points.',
        type: 'error'
      });
      return;
    } else {
      this.storyPoints = Number(trimmed);
    }

    this.isLoading = true;
    this.hasSearched = true;

    setTimeout(() => {
      try {
        // Mock di dati (come se arrivassero dal backend)
        const allTasks = [
          { projectName: 'PokerApp', title: 'Implement login', closeDate: '2025-11-02', assignee: 'Mario Rossi', storyPoints: 8 },
          { projectName: 'PokerApp', title: 'Fix layout', closeDate: '2025-11-05', assignee: 'Luca Bianchi', storyPoints: 8 },
          { projectName: 'PokerApp', title: 'Add search bar', closeDate: '2025-11-06', assignee: 'Anna Verdi', storyPoints: 8 },
          { projectName: 'PokerApp', title: 'Optimize styles', closeDate: '2025-11-07', assignee: 'Sara Neri', storyPoints: 8 },
          { projectName: 'PokerApp', title: 'Refactor auth guard', closeDate: '2025-11-08', assignee: 'Giulia Ferri', storyPoints: 3 },
          { projectName: 'PokerApp', title: 'Create detail view', closeDate: '2025-11-09', assignee: 'Marco Gialli', storyPoints: 8 },
          { projectName: 'PokerApp', title: 'Deploy mock server', closeDate: '2025-11-10', assignee: 'Stefano Blu', storyPoints: 8 },
        ];

        // Filtra per story points e ordina per data (decrescente)
        this.tasks = allTasks
          .filter(t => t.storyPoints === this.storyPoints)
          .sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())
          .slice(0, 10);

        if (this.tasks.length === 0) {
          this.notificationService.showMessage({
            message: 'Nessun elemento disponibile per i criteri selezionati.',
            type: 'info'
          });
        } else {
          this.notificationService.showMessage({
            message: `${this.tasks.length} task trovati per ${this.storyPoints} SP.`,
            type: 'success'
          });
        }
      } catch {
        this.notificationService.showMessage({
          message: 'Errore di comunicazione con il backend. Riprova più tardi.',
          type: 'error'
        });
      } finally {
        this.isLoading = false;
      }
    }, 800);
  }
}
