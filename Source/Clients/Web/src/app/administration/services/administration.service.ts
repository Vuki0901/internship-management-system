import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStatistics {
  // User Statistics
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalSupervisors: number;
  totalAdministrators: number;

  // Internship Provider Statistics
  totalInternshipProviders: number;
  activeInternshipProviders: number;

  // Internship Statistics
  totalInternships: number;
  pendingInternships: number;
  acceptedInternships: number;
  rejectedInternships: number;
  completedInternships: number;
  inProgressInternships: number;

  // Report Statistics
  totalReports: number;
  pendingReports: number;
  gradedReports: number;
  confirmedReports: number;

  // Recent Activity
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: string; // "User", "Internship", "Provider", "Report"
  description: string;
  userName: string;
  createdOn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private readonly baseUrl = `${environment.apiUrl}/administration`;

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${this.baseUrl}/dashboard/statistics`);
  }
} 