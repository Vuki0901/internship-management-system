import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { 
  InternshipSupervisorService, 
  InternshipInformation, 
  PendingReportInfo,
  InternshipProviderInfo,
  InternshipStatus,
  StudyLevel
} from '../services/internship-supervisor.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChipModule,
    ProgressSpinnerModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>{{ 'supervisor.dashboard.title' | translate }}</h1>
        <p>{{ 'supervisor.dashboard.subtitle' | translate }}</p>
      </header>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-internships">
                <i class="fa-solid fa-briefcase"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalInternships }}</div>
                <div class="stat-label">{{ 'supervisor.dashboard.total_internships' | translate }}</div>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending-reports">
                <i class="fa-solid fa-clock"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingReportsCount }}</div>
                <div class="stat-label">{{ 'supervisor.dashboard.pending_reports' | translate }}</div>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon completed-internships">
                <i class="fa-solid fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ completedInternships }}</div>
                <div class="stat-label">{{ 'supervisor.dashboard.completed_internships' | translate }}</div>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-providers">
                <i class="fa-solid fa-building"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalProviders }}</div>
                <div class="stat-label">{{ 'supervisor.dashboard.total_providers' | translate }}</div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <p-card class="actions-card">
            <h3>{{ 'supervisor.dashboard.quick_actions' | translate }}</h3>
            <div class="actions-grid">
              <p-button 
                [label]="'supervisor.dashboard.all_internships' | translate" 
                icon="pi pi-briefcase" 
                severity="info"
                [outlined]="true"
                (onClick)="navigateToInternships()"
                class="action-button">
              </p-button>
              
              <p-button 
                [label]="'supervisor.dashboard.pending_grading' | translate" 
                icon="pi pi-clock" 
                severity="warn"
                [outlined]="true"
                (onClick)="navigateToPendingReports()"
                [badge]="pendingReportsCount > 0 ? pendingReportsCount.toString() : ''"
                class="action-button">
              </p-button>
              
              <p-button 
                [label]="'supervisor.dashboard.providers' | translate" 
                icon="pi pi-building" 
                severity="secondary"
                [outlined]="true"
                (onClick)="navigateToProviders()"
                class="action-button">
              </p-button>
              
              <p-button 
                [label]="'supervisor.dashboard.documents' | translate" 
                icon="pi pi-file" 
                severity="help"
                [outlined]="true"
                (onClick)="navigateToDocuments()"
                class="action-button">
              </p-button>
            </div>
          </p-card>
        </div>

        <!-- Recent Activity -->
        @if (recentInternships.length > 0) {
          <div class="recent-section">
            <p-card class="recent-card">
              <h3>{{ 'supervisor.dashboard.recent_internships' | translate }}</h3>
              <div class="recent-list">
                @for (internship of recentInternships; track internship.id) {
                  <div class="recent-item">
                    <div class="recent-info">
                      <div class="recent-student">
                        <strong>{{ getStudentName(internship) }}</strong>
                        <small>{{ internship.internshipProvider?.name || ('supervisor.dashboard.unknown_provider' | translate) }}</small>
                      </div>
                      <div class="recent-status">
                        <p-chip 
                          [label]="getStatusText(internship.status)"
                          [style]="getStatusStyle(internship.status)"
                          size="small">
                        </p-chip>
                      </div>
                    </div>
                    @if (internship.status === InternshipStatus.Completed) {
                      <p-button 
                        [label]="'supervisor.dashboard.report' | translate" 
                        icon="pi pi-file-text" 
                        size="small"
                        severity="info"
                        [text]="true"
                        (onClick)="viewReport(internship.id)">
                      </p-button>
                    }
                  </div>
                }
              </div>
            </p-card>
          </div>
        }

        @if (loading) {
          <div class="loading-overlay">
            <p-progressSpinner></p-progressSpinner>
            <p>{{ 'supervisor.dashboard.loading_data' | translate }}</p>
          </div>
        }
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 0 0.5rem 0;
    }

    .dashboard-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.total-internships {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-icon.pending-reports {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-icon.completed-internships {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-icon.total-providers {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .actions-section, .recent-section {
      width: 100%;
    }

    .actions-card, .recent-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .actions-card h3, .recent-card h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-button {
      width: 100%;
      justify-content: flex-start;
    }

    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .recent-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      margin-right: 1rem;
    }

    .recent-student {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .recent-student strong {
      color: #333;
      font-size: 0.95rem;
    }

    .recent-student small {
      color: #666;
      font-size: 0.8rem;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      color: #666;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }
      
      .dashboard-header h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .recent-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .recent-status {
        align-self: flex-start;
      }
    }
  `]
})
export class SupervisorDashboardComponent implements OnInit {
  loading = false;
  
  // Statistics
  totalInternships = 0;
  pendingReportsCount = 0;
  completedInternships = 0;
  totalProviders = 0;
  
  // Recent data
  recentInternships: InternshipInformation[] = [];
  
  // Expose enum to template
  InternshipStatus = InternshipStatus;

  constructor(
    private supervisorService: InternshipSupervisorService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Initialize translations
    this.translationService.initializeLanguage();
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all data in parallel
    Promise.all([
      this.loadInternshipsStats(),
      this.loadPendingReports(),
      this.loadProviders(),
      this.loadRecentInternships()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private loadInternshipsStats(): Promise<void> {
    return new Promise((resolve) => {
      // Use default pageSize (int.MaxValue from backend) to get all internships for statistics
      this.supervisorService.getInternships(1).subscribe({
        next: (response) => {
          this.totalInternships = response.totalCount;
          this.completedInternships = response.internships.filter(
            i => i.status === InternshipStatus.Completed
          ).length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading internships stats:', error);
          resolve();
        }
      });
    });
  }

  private loadPendingReports(): Promise<void> {
    return new Promise((resolve) => {
      this.supervisorService.getPendingReports().subscribe({
        next: (response) => {
          this.pendingReportsCount = response.pendingReports.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading pending reports:', error);
          resolve();
        }
      });
    });
  }

  private loadProviders(): Promise<void> {
    return new Promise((resolve) => {
      this.supervisorService.getInternshipProviders().subscribe({
        next: (response) => {
          this.totalProviders = response.internshipProviders.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          resolve();
        }
      });
    });
  }

  private loadRecentInternships(): Promise<void> {
    return new Promise((resolve) => {
      this.supervisorService.getInternships(1, 5).subscribe({
        next: (response) => {
          this.recentInternships = response.internships.slice(0, 5);
          resolve();
        },
        error: (error) => {
          console.error('Error loading recent internships:', error);
          resolve();
        }
      });
    });
  }

  // Navigation methods
  navigateToInternships(): void {
    this.router.navigate(['/supervisor/internships']);
  }

  navigateToPendingReports(): void {
    this.router.navigate(['/supervisor/pending-reports']);
  }

  navigateToProviders(): void {
    this.router.navigate(['/supervisor/providers']);
  }

  navigateToDocuments(): void {
    this.router.navigate(['/supervisor/documents']);
  }

  viewReport(internshipId: string): void {
    this.router.navigate(['/supervisor/internships', internshipId, 'report']);
  }

  // Helper methods
  getStudentName(internship: InternshipInformation): string {
    if (!internship.student) return this.translationService.instant('common.unknown_student');
    
    const student = internship.student;
    return student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.emailAddress;
  }

  getStatusText(status: InternshipStatus | string | number): string {
    // Handle string values from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return this.translationService.instant('status.pending');
        case 'Accepted': return this.translationService.instant('status.accepted');
        case 'Rejected': return this.translationService.instant('status.rejected');
        case 'Completed': return this.translationService.instant('status.completed');
        default: return this.translationService.instant('status.unknown');
      }
    }
    
    // Handle numeric enum values
    const numericStatus = Number(status);
    switch (numericStatus) {
      case InternshipStatus.Pending: return this.translationService.instant('status.pending');
      case InternshipStatus.Accepted: return this.translationService.instant('status.accepted');
      case InternshipStatus.Rejected: return this.translationService.instant('status.rejected');
      case InternshipStatus.Completed: return this.translationService.instant('status.completed');
      default: return this.translationService.instant('status.unknown');
    }
  }

  getStatusStyle(status: InternshipStatus | string | number): any {
    // Handle string values from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return { 'background-color': '#ffc107', 'color': '#000' };
        case 'Accepted': return { 'background-color': '#28a745', 'color': '#fff' };
        case 'Rejected': return { 'background-color': '#dc3545', 'color': '#fff' };
        case 'Completed': return { 'background-color': '#17a2b8', 'color': '#fff' };
        default: return { 'background-color': '#6c757d', 'color': '#fff' };
      }
    }
    
    // Handle numeric enum values
    const numericStatus = Number(status);
    switch (numericStatus) {
      case InternshipStatus.Pending: return { 'background-color': '#ffc107', 'color': '#000' };
      case InternshipStatus.Accepted: return { 'background-color': '#28a745', 'color': '#fff' };
      case InternshipStatus.Rejected: return { 'background-color': '#dc3545', 'color': '#fff' };
      case InternshipStatus.Completed: return { 'background-color': '#17a2b8', 'color': '#fff' };
      default: return { 'background-color': '#6c757d', 'color': '#fff' };
    }
  }
} 