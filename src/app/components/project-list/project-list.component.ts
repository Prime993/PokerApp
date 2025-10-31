import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // 🔹 Import Router
import { CardComponent } from '../../uicomponents/card/card.component';
import { ButtonComponent } from '../../uicomponents/button/button.component';

@Component({
  selector: 'project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  searchTerm: string = '';

  projects = [
  { id: 1, name: 'Progetto Alpha', description: 'Gestione utenti e ruoli' },
  { id: 2, name: 'Progetto Beta', description: 'Integrazione con Jira API' },
  { id: 3, name: 'Progetto Gamma', description: 'Dashboard e analitiche' },
  { id: 4, name: 'Progetto Delta', description: 'Modulo sperimentale' },
  { id: 5, name: 'Progetto Epsilon', description: 'Analisi dati' },
];

  constructor(private router: Router) {} // 🔹 Iniettiamo Router

  get filteredProjects() {
    const term = this.searchTerm.toLowerCase();
    return this.projects.filter(p => p.name.toLowerCase().includes(term));
  }

  openProject(project: any) {
  console.log('Apertura progetto:', project.name);
  this.router.navigate(['/project', project.id], { state: { name: project.name } });
}




  logout() {
  localStorage.removeItem('isAuthenticated');
  this.router.navigate(['/login']);
  }

}
