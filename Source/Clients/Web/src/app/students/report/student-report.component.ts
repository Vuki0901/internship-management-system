import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { InternshipReportService, InternshipReport } from '../services/internship-report.service';
import { InternshipsService, InternshipInformation, InternshipStatus } from '../services/internships.service';
import { PdfDownloadService } from '../../shared/services/pdf-download.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-student-report',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    ChipModule,
    DividerModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>{{ 'student.report.title' | translate }}</h1>
        <p-button 
          [label]="'student.report.back_to_internships' | translate"
          icon="pi pi-arrow-left"
          severity="secondary"
          [outlined]="true"
          (onClick)="goBack()">
        </p-button>
      </header>

      <div class="content-wrapper">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>{{ 'student.report.loading' | translate }}</p>
        </div>

        <!-- No Report State -->
        <div *ngIf="!loading && !report && internship && canGenerateReport" class="no-report-container">
          <p-card>
            <div class="no-report-content">
              <i class="pi pi-file-export no-report-icon"></i>
              <h2>{{ 'student.report.generate_report_title' | translate }}</h2>
              <p>{{ 'student.report.generate_report_description' | translate }}</p>
              
              <div class="internship-summary">
                <h3>{{ 'student.report.internship_overview' | translate }}</h3>
                <div class="summary-item">
                  <strong>{{ 'student.report.company' | translate }}:</strong> {{ internship.internshipProvider?.name }}
                </div>
                <div class="summary-item">
                  <strong>{{ 'student.report.study' | translate }}:</strong> {{ getStudyLevelText(internship.studyLevel) }}
                </div>
                <div class="summary-item">
                  <strong>{{ 'student.report.status' | translate }}:</strong> 
                  <p-chip [label]="getStatusText(internship.status)" [style]="{'background-color': '#d4edda', 'color': '#155724'}"></p-chip>
                </div>
              </div>

              <p-button 
                [label]="'student.report.generate_report' | translate"
                icon="pi pi-plus"
                [loading]="generating"
                (onClick)="generateReport()"
                [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}">
              </p-button>
            </div>
          </p-card>
        </div>

        <!-- Report Display -->
        <div *ngIf="!loading && report" class="report-container">
          <p-card>
            <div class="report-header">
              <h2>{{ 'student.report.title' | translate }}</h2>
              <div class="report-meta">
                <span class="creation-date">{{ 'student.report.creation_date' | translate }}: {{ formatDate(report.createdOn) }}</span>
                <p-chip 
                  [label]="report.isConfirmedByMentor ? ('student.report.confirmed_by_mentor' | translate) : ('student.report.awaiting_confirmation' | translate)"
                  [style]="getConfirmationChipStyle(report.isConfirmedByMentor)">
                </p-chip>
                <div *ngIf="report.isConfirmedByMentor" class="download-actions">
                  <p-button 
                    [label]="'student.report.download_pdf' | translate"
                    icon="pi pi-download"
                    severity="success"
                    [outlined]="true"
                    [loading]="downloadingPdf"
                    (onClick)="downloadPdf()"
                    [style]="{'margin-top': '0.5rem'}">
                  </p-button>
                </div>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Automatic Data Section -->
            <div class="report-section">
              <h3>{{ 'student.report.automatic_data' | translate }}</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalHoursWorked }}</div>
                  <div class="stat-label">{{ 'student.report.total_hours' | translate }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalLogEntries }}</div>
                  <div class="stat-label">{{ 'student.report.total_entries' | translate }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ getAverageHours() }}</div>
                  <div class="stat-label">{{ 'student.report.average_hours' | translate }}</div>
                </div>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Mentor Content Section -->
            <div class="report-section">
              <h3>{{ 'student.report.mentor_evaluation' | translate }}</h3>
              <div *ngIf="report.mentorContent && report.mentorContent.trim().length > 0" class="mentor-content">
                <h4>{{ 'student.report.mentor_comment' | translate }}</h4>
                <div class="content-box">{{ report.mentorContent }}</div>
              </div>
              <div *ngIf="!report.mentorContent || report.mentorContent.trim().length === 0" class="no-content">
                <p>{{ 'student.report.mentor_no_comment' | translate }}</p>
              </div>

              <div class="grade-section">
                <h4>{{ 'student.report.grade' | translate }}</h4>
                <div *ngIf="report.grade" class="grade-display">
                  <span class="grade-value">{{ report.grade }}</span>
                  <span class="grade-max">/5</span>
                  <span class="grade-text">({{ getGradeText(report.grade) }})</span>
                </div>
                <div *ngIf="!report.grade" class="no-grade">
                  <p>{{ 'student.report.grade_not_assigned' | translate }}</p>
                </div>
              </div>

              <div *ngIf="report.isConfirmedByMentor && report.confirmedAt" class="confirmation-info">
                <p><strong>{{ 'student.report.confirmed_by_mentor_on' | translate }}</strong> {{ formatDate(report.confirmedAt) }}</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !report && !canGenerateReport" class="error-container">
          <p-card>
            <div class="error-content">
              <i class="pi pi-exclamation-triangle error-icon"></i>
              <h2>{{ 'student.report.report_not_available' | translate }}</h2>
              <p>{{ 'student.report.report_not_available_description' | translate }}</p>
              <p-button 
                [label]="'student.report.back_to_internships' | translate"
                icon="pi pi-arrow-left"
                severity="secondary"
                (onClick)="goBack()">
              </p-button>
            </div>
          </p-card>
        </div>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }

    .content-wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .loading-container p {
      margin-top: 1rem;
      color: #6c757d;
    }

    .no-report-container, .error-container {
      display: flex;
      justify-content: center;
    }

    .no-report-content, .error-content {
      text-align: center;
      padding: 2rem;
    }

    .no-report-icon, .error-icon {
      font-size: 4rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .error-icon {
      color: #ffc107;
    }

    .no-report-content h2, .error-content h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .internship-summary {
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 12px;
      margin: 2rem 0;
      text-align: left;
      border-left: 4px solid var(--primary-color);
    }

    .internship-summary h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
      font-size: 1.3rem;
    }

    .summary-item {
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1rem;
    }

    .report-container {
      width: 100%;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .report-header h2 {
      color: var(--primary-color);
      margin: 0;
    }

    .report-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .creation-date {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .report-section {
      margin: 1.5rem 0;
    }

    .report-section h3 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .stat-card {
      background: linear-gradient(135deg, var(--primary-color), #1e3a5f);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      opacity: 0.9;
    }

    .mentor-content h4, .grade-section h4 {
      margin-bottom: 0.75rem;
      color: var(--primary-color);
      font-size: 1.1rem;
    }

    .content-box {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
      line-height: 1.6;
      white-space: pre-wrap;
      font-size: 1rem;
    }

    .no-content, .no-grade {
      color: #6c757d;
      font-style: italic;
      font-size: 1rem;
    }

    .grade-display {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-top: 0.75rem;
    }

    .grade-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .grade-max {
      font-size: 1.2rem;
      color: #6c757d;
    }

    .grade-text {
      margin-left: 0.5rem;
      color: #6c757d;
      font-weight: 500;
      font-size: 1rem;
    }

    .confirmation-info {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #d4edda;
      border-radius: 8px;
      color: #155724;
      font-size: 1rem;
    }

    .download-actions {
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .report-header {
        flex-direction: column;
        align-items: stretch;
      }

      .report-meta {
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .internship-summary {
        padding: 1.5rem;
      }
    }
  `]
})
export class StudentReportComponent implements OnInit {
  internshipId: string = '';
  internship: InternshipInformation | null = null;
  report: InternshipReport | null = null;
  loading = false;
  generating = false;
  downloadingPdf = false;
  canGenerateReport = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: InternshipReportService,
    private internshipsService: InternshipsService,
    private messageService: MessageService,
    private pdfDownloadService: PdfDownloadService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.internshipId = this.route.snapshot.paramMap.get('id') || '';
    if (this.internshipId) {
      this.loadInternshipAndReport();
    }
  }

  loadInternshipAndReport(): void {
    this.loading = true;
    
    // Load internship details first
    this.internshipsService.getInternships().subscribe({
      next: (result) => {
        this.internship = result.internships.find(i => i.id === this.internshipId) || null;
        this.canGenerateReport = this.isCompletedInternship(this.internship?.status);
        
        // Only try to load existing report if the internship is completed
        if (this.canGenerateReport) {
          this.loadReport();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.showError(this.translationService.instant('student.report.load_error'));
      }
    });
  }

  loadReport(): void {
    this.reportService.getReport(this.internshipId).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: () => {
        // Report doesn't exist yet, which is fine
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    this.generating = true;
    
    this.reportService.generateReport(this.internshipId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('student.report.generate_success')
        });
        this.generating = false;
        this.loadReport(); // Reload to show the new report
      },
      error: () => {
        this.generating = false;
        this.showError(this.translationService.instant('student.report.generate_error'));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/internships']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAverageHours(): string {
    if (!this.report || this.report.totalLogEntries === 0) return '0';
    const avg = this.report.totalHoursWorked / this.report.totalLogEntries;
    return avg.toFixed(1);
  }

  getConfirmationChipStyle(isConfirmed: boolean): any {
    return isConfirmed 
      ? { 'background-color': '#d4edda', 'color': '#155724' }
      : { 'background-color': '#fff3cd', 'color': '#856404' };
  }

  getGradeText(grade: number): string {
    switch (grade) {
      case 5: return this.translationService.instant('student.report.grade_excellent');
      case 4: return this.translationService.instant('student.report.grade_very_good');
      case 3: return this.translationService.instant('student.report.grade_good');
      case 2: return this.translationService.instant('student.report.grade_satisfactory');
      case 1: return this.translationService.instant('student.report.grade_insufficient');
      default: return '';
    }
  }

  getStudyLevelText(level: any): string {
    if (!level) return this.translationService.instant('common.study_level.unknown');
    
    // Handle both string and numeric values
    const levelStr = String(level).toLowerCase();
    switch (levelStr) {
      case '1':
      case 'undergraduate':
        return this.translationService.instant('common.study_level.undergraduate');
      case '2':
      case 'graduate':
        return this.translationService.instant('common.study_level.graduate');
      default:
        return this.translationService.instant('common.study_level.unknown');
    }
  }

  getStatusText(status: any): string {
    if (!status) return this.translationService.instant('common.status.unknown');
    
    // Handle both string and numeric values
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case '1':
      case 'pending':
        return this.translationService.instant('common.status.pending');
      case '2':
      case 'accepted':
        return this.translationService.instant('common.status.accepted');
      case '3':
      case 'rejected':
        return this.translationService.instant('common.status.rejected');
      case '4':
      case 'completed':
        return this.translationService.instant('common.status.completed');
      default:
        return this.translationService.instant('common.status.unknown');
    }
  }

  private isCompletedInternship(status: any): boolean {
    if (!status) return false;
    
    // Handle all possible formats: numeric enum, string enum, or string value
    const statusStr = String(status).toLowerCase();
    return statusStr === '4' || statusStr === 'completed';
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translationService.instant('common.error'),
      detail: message
    });
  }

  downloadPdf(): void {
    if (!this.report?.isConfirmedByMentor) {
      this.showError(this.translationService.instant('student.report.download_error'));
      return;
    }

    this.downloadingPdf = true;
    
    this.reportService.downloadReportPdf(this.internshipId).subscribe({
      next: (pdfResponse) => {
        try {
          this.pdfDownloadService.downloadPdf(pdfResponse);
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('student.report.download_success')
          });
        } catch (error) {
          this.showError(this.translationService.instant('student.report.download_error'));
        }
        this.downloadingPdf = false;
      },
      error: (error) => {
        this.downloadingPdf = false;
        if (error.status === 403) {
          this.showError(this.translationService.instant('student.report.download_error'));
        } else {
          this.showError(this.translationService.instant('student.report.download_error'));
        }
      }
    });
  }
} 