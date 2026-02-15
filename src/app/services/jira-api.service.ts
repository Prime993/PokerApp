import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JiraApiService {
  private readonly baseUrl = '/api/jira'; // grazie al proxy

  constructor(private http: HttpClient) {}

  session(): Observable<{ authenticated: boolean }> {
    return this.http.get<{ authenticated: boolean }>(`${this.baseUrl}/session`);
  }

  login(email: string, apiToken: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/login`, { email, apiToken });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects`);
  }

  getIssues(projectId: string, storyPoints: number): Observable<any[]> {
    const params = new HttpParams().set('projectId', projectId).set('storyPoints', storyPoints);
    return this.http.get<any[]>(`${this.baseUrl}/issues`, { params });
  }
}