import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from '../../uicomponents/card/card.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';
import { JiraApiService } from '../../services/jira-api.service';

@Component({
  selector: 'project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  searchTerm: string = '';
  projects: any[] = [];
  isLoading = false;

  constructor(private router: Router, private jiraApi: JiraApiService) {}

  ngOnInit() {
    this.isLoading = true;

    this.jiraApi.getProjects().subscribe({
      next: (p) => {
        this.projects = p;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get filteredProjects() {
    const term = this.searchTerm.toLowerCase();
    return this.projects.filter((p) => (p.name ?? '').toLowerCase().includes(term));
  }

  openProject(project: any) {
    console.log('Apertura progetto:', project.name);
    this.router.navigate(['/project', project.id], { state: { name: project.name } });
  }

  logout() {
    this.jiraApi.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}