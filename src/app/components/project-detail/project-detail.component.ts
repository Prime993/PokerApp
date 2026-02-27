import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { CardComponent } from '../../uicomponents/card/card.component';
import { InputFieldComponent } from '../../uicomponents/input-field/input-field.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';
import { JiraApiService } from '../../services/jira-api.service';
import { ToggleFilterComponent } from '../../uicomponents/toggle-filter/toggle-filter.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputFieldComponent, ButtonComponent,ToggleFilterComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectId!: string;
  projectName: string = '';
  storyPointsInput: string = '';
  storyPoints: number = 0;
  effortEstimationInput: string = '';
  effortEstimation: number = 0;

  tasks: any[] = [];
  isLoading = false;
  hasSearched = false;
  filterType: 'storyPoints' | 'effortEstimation' = 'storyPoints'; //toggle

  get filterLabel(): string {
  return this.filterType === 'storyPoints'
    ? 'Story Points'
    : 'Effort Estimation (hrs)';
}


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private jiraApi: JiraApiService
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

  onFilterChange(type: 'storyPoints' | 'effortEstimation') { this.filterType = type; } //toggle

  onSearch() {
    const trimmed = this.storyPointsInput.trim();

    if (trimmed === '') {
      this.storyPoints = 0;
    } else if (isNaN(Number(trimmed))) {
      this.notificationService.showMessage({
        message: 'Inserisci un valore numerico valido.',
        type: 'error'
      });
      return;
    } else {
      this.storyPoints = Number(trimmed);
    }

    this.isLoading = true;
    this.hasSearched = true;

    this.jiraApi.getIssues(this.projectId, this.storyPoints).subscribe({
      next: (issues) => {
        this.tasks = issues
          .map((i: any) => ({
            projectName: i.fields?.project?.name ?? this.projectName,
            title: i.fields?.summary ?? '',
            closeDate: i.fields?.updated ?? i.fields?.created ?? '',
            assignee: i.fields?.assignee?.displayName ?? 'Unassigned',
            storyPoints: i.fields?.storyPoints ?? this.storyPoints
          }))
          .sort((a: any, b: any) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())
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

        this.isLoading = false;
      },
      error: () => {
        this.notificationService.showMessage({
          message: 'Errore di comunicazione con il backend (sessione scaduta o credenziali non valide).',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }
}