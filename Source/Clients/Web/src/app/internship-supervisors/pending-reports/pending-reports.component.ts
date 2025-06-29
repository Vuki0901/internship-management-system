import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { 
  InternshipSupervisorService, 
  PendingReportInfo, 
  InternshipStatus, 
  StudyLevel
} from '../services/internship-supervisor.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-supervisor-pending-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    ChipModule,
    ToastModule,
    ProgressSpinnerModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>{{ 'supervisor.pending_reports.title' | translate }}</h1>
        <p>{{ 'supervisor.pending_reports.subtitle' | translate }}</p>
      </header>

      <div class="content-wrapper">
        <p-card class="reports-card">
          <div class="reports-header">
            <h3>{{ 'supervisor.pending_reports.title' | translate }} ({{ pendingReports.length }})</h3>
            @if (pendingReports.length > 0) {
              <p class="priority-note">
                <i class="fa-solid fa-info-circle"></i>
                {{ 'supervisor.pending_reports.sorted_by_confirmation' | translate }}
              </p>
            }
          </div>

          @if (loading) {
            <div class="loading-container">
              <p-progressSpinner></p-progressSpinner>
              <p>{{ 'supervisor.pending_reports.loading' | translate }}</p>
            </div>
          } @else if (pendingReports.length === 0) {
            <div class="no-reports">
              <i class="fa-solid fa-clipboard-check"></i>
              <h3>{{ 'supervisor.pending_reports.no_pending_reports' | translate }}</h3>
              <p>{{ 'supervisor.pending_reports.no_pending_reports_message' | translate }}</p>
            </div>
          } @else {
            <p-table [value]="pendingReports" [responsive]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>{{ 'supervisor.pending_reports.student' | translate }}</th>
                  <th>{{ 'supervisor.pending_reports.provider' | translate }}</th>
                  <th>{{ 'supervisor.pending_reports.study_level' | translate }}</th>
                  <th>{{ 'common.total_hours' | translate }}</th>
                  <th>{{ 'common.log_entries' | translate }}</th>
                  <th>{{ 'common.confirmed' | translate }}</th>
                  <th>{{ 'common.mentor' | translate }}</th>
                  <th>{{ 'supervisor.pending_reports.actions' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-report>
                <tr>
                  <td>
                    @if (report.internship.student) {
                      <div class="student-info">
                        <strong>{{ report.internship.student.fullName || (report.internship.student.firstName + ' ' + report.internship.student.lastName) }}</strong>
                        <small>{{ report.internship.student.emailAddress }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    @if (report.internship.internshipProvider) {
                      <div class="provider-info">
                        <strong>{{ report.internship.internshipProvider.name }}</strong>
                        <small>{{ report.internship.internshipProvider.address }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    <p-chip 
                      [label]="getStudyLevelText(report.internship.studyLevel)"
                      [style]="getStudyLevelStyle(report.internship.studyLevel)">
                    </p-chip>
                  </td>
                  <td>
                    <div class="hours-info">
                      <strong>{{ report.totalHoursWorked }}h</strong>
                    </div>
                  </td>
                  <td>
                    <div class="entries-info">
                      <strong>{{ report.totalLogEntries }}</strong>
                    </div>
                  </td>
                  <td>
                    <div class="confirmed-info">
                      <small>{{ formatDate(report.confirmedAt) }}</small>
                      <div class="days-waiting">
                        {{ getDaysWaitingText(report.confirmedAt) }}
                      </div>
                    </div>
                  </td>
                  <td>
                    @if (report.internship.mentor) {
                      <div class="mentor-info">
                        <strong>{{ report.internship.mentor.fullName || (report.internship.mentor.firstName + ' ' + report.internship.mentor.lastName) }}</strong>
                        <small>{{ report.internship.mentor.emailAddress }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    <div class="action-buttons">
                      <p-button 
                        [label]="'supervisor.pending_reports.grade_report' | translate" 
                        icon="pi pi-star" 
                        size="small"
                        severity="success"
                        (onClick)="gradeReport(report.internshipId)"
                        [style]="{'font-size': '0.8rem', 'margin-right': '0.5rem'}">
                      </p-button>
                      <p-button 
                        [label]="'common.view' | translate" 
                        icon="pi pi-eye" 
                        size="small"
                        severity="info"
                        [outlined]="true"
                        (onClick)="viewReport(report.internshipId)"
                        [style]="{'font-size': '0.8rem'}">
                      </p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .page-header {
      margin-bottom: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 0 0.5rem 0;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .content-wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }

    .reports-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .reports-header {
      margin-bottom: 1.5rem;
    }

    .reports-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .priority-note {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .priority-note i {
      color: var(--primary-color);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .no-reports {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-reports i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #28a745;
    }

    .no-reports h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .student-info, .provider-info, .mentor-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .student-info strong, .provider-info strong, .mentor-info strong {
      color: #333;
      font-size: 0.9rem;
    }

    .student-info small, .provider-info small, .mentor-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .hours-info, .entries-info {
      text-align: center;
    }

    .hours-info strong, .entries-info strong {
      color: var(--primary-color);
      font-size: 1rem;
    }

    .confirmed-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-align: center;
    }

    .confirmed-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .days-waiting {
      font-size: 0.75rem;
      color: #dc3545;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .text-muted {
      color: #999;
      font-style: italic;
    }

    :host ::ng-deep .p-table .p-datatable-thead > tr > th {
      background-color: #f8f9fa;
      border-color: #dee2e6;
      font-weight: 600;
      color: #333;
      padding: 1rem 0.75rem;
    }

    :host ::ng-deep .p-table .p-datatable-tbody > tr > td {
      padding: 1rem 0.75rem;
      border-color: #dee2e6;
    }

    :host ::ng-deep .p-table .p-datatable-tbody > tr:hover {
      background-color: #f8f9fa;
    }

    /* Highlight urgent reports (waiting more than 7 days) */
    :host ::ng-deep .p-table .p-datatable-tbody > tr.urgent {
      background-color: #fff3cd;
    }

    :host ::ng-deep .p-table .p-datatable-tbody > tr.urgent:hover {
      background-color: #ffeaa7;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class SupervisorPendingReportsComponent implements OnInit {
  pendingReports: PendingReportInfo[] = [];
  loading = false;

  constructor(
    private supervisorService: InternshipSupervisorService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Initialize translations
    this.translationService.initializeLanguage();
    
    this.loadPendingReports();
  }

  loadPendingReports(): void {
    this.loading = true;
    
    this.supervisorService.getPendingReports().subscribe({
      next: (response) => {
        this.pendingReports = response.pendingReports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending reports:', error);
        this.loading = false;
        this.showError(this.translationService.instant('supervisor.pending_reports.loading_error'));
      }
    });
  }

  gradeReport(internshipId: string): void {
    this.router.navigate(['/supervisor/internships', internshipId, 'report'], {
      queryParams: { mode: 'grade' }
    });
  }

  viewReport(internshipId: string): void {
    this.router.navigate(['/supervisor/internships', internshipId, 'report']);
  }

  getStudyLevelText(level: StudyLevel | string | number): string {
    // Handle string values from backend
    if (typeof level === 'string') {
      switch (level) {
        case 'Undergraduate': return this.translationService.instant('common.study_level.undergraduate');
        case 'Graduate': return this.translationService.instant('common.study_level.graduate');
        default: return this.translationService.instant('common.unknown');
      }
    }
    
    // Handle numeric enum values
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return this.translationService.instant('common.study_level.undergraduate');
      case StudyLevel.Graduate: return this.translationService.instant('common.study_level.graduate');
      default: return this.translationService.instant('common.unknown');
    }
  }

  getStudyLevelStyle(level: StudyLevel | string | number): any {
    // Handle string values from backend
    if (typeof level === 'string') {
      switch (level) {
        case 'Undergraduate': return { 'background-color': '#007bff', 'color': '#fff' };
        case 'Graduate': return { 'background-color': '#6f42c1', 'color': '#fff' };
        default: return { 'background-color': '#6c757d', 'color': '#fff' };
      }
    }
    
    // Handle numeric enum values
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return { 'background-color': '#007bff', 'color': '#fff' };
      case StudyLevel.Graduate: return { 'background-color': '#6f42c1', 'color': '#fff' };
      default: return { 'background-color': '#6c757d', 'color': '#fff' };
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hr-HR');
    } catch {
      return '-';
    }
  }

  getDaysWaiting(confirmedAt: string): number {
    try {
      const confirmedDate = new Date(confirmedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - confirmedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }

  getDaysWaitingText(confirmedAt: string): string {
    const days = this.getDaysWaiting(confirmedAt);
    return this.translationService.instant('common.days_waiting', { days });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translationService.instant('common.error'),
      detail: message,
      life: 5000
    });
  }
} 