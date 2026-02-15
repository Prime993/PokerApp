import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JiraApiService } from '../services/jira-api.service';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private jiraApi: JiraApiService) {}

  canActivate() {
    return this.jiraApi.session().pipe(
      map((r) => {
        if (!r.authenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}