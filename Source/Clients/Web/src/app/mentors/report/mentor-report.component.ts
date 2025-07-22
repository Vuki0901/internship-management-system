import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { InputTextarea } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MentorReportService, InternshipReport, UpdateInternshipReportRequest } from '../services/mentor-report.service';
import { PdfDownloadService } from '../../shared/services/pdf-download.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-mentor-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    ChipModule,
    DividerModule,
    InputTextarea,
    CheckboxModule,
    ConfirmDialogModule,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>{{ 'mentor.report.title' | translate }}</h1>
        <div class="header-actions">
          <p-button 
            [label]="'mentor.report.back_to_internships' | translate"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            (onClick)="goBack()">
          </p-button>
          <div *ngIf="report?.isConfirmedByMentor" class="download-actions">
            <p-button 
              [label]="'mentor.report.download_pdf' | translate"
              icon="pi pi-download"
              severity="success"
              [outlined]="true"
              [loading]="downloadingPdf"
              (onClick)="downloadPdf()"
              [style]="{'margin-left': '1rem'}">
            </p-button>
          </div>
        </div>
      </header>

      <div class="content-wrapper">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>{{ 'mentor.report.loading' | translate }}</p>
        </div>

        <!-- No Report State -->
        <div *ngIf="!loading && !report" class="no-report-container">
          <p-card>
            <div class="no-report-content">
              <i class="pi pi-exclamation-triangle no-report-icon"></i>
              <h2>{{ 'mentor.report.not_available' | translate }}</h2>
              <p>{{ 'mentor.report.student_not_generated' | translate }}</p>
              <p-button 
                [label]="'mentor.report.back_to_internships' | translate"
                icon="pi pi-arrow-left"
                severity="secondary"
                (onClick)="goBack()">
              </p-button>
            </div>
          </p-card>
        </div>

        <!-- Report Display and Edit -->
        <div *ngIf="!loading && report" class="report-container">
          <p-card>
            <div class="report-header">
              <h2>{{ 'mentor.report.internship_report' | translate }}</h2>
              <div class="report-meta">
                <span class="creation-date">{{ 'mentor.report.created' | translate }}: {{ formatDate(report.createdOn) }}</span>
                <p-chip 
                  [label]="report.isConfirmedByMentor ? ('mentor.report.confirmed' | translate) : ('mentor.report.unconfirmed' | translate)"
                  [style]="getConfirmationChipStyle(report.isConfirmedByMentor)">
                </p-chip>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Student Data Section -->
            <div class="report-section">
              <h3>{{ 'mentor.report.student_data' | translate }}</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalHoursWorked }}</div>
                  <div class="stat-label">{{ 'mentor.report.total_hours' | translate }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalLogEntries }}</div>
                  <div class="stat-label">{{ 'mentor.report.log_entries' | translate }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ getAverageHours() }}</div>
                  <div class="stat-label">{{ 'mentor.report.average_hours' | translate }}</div>
                </div>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Mentor Assessment Form -->
            <div class="report-section">
              <h3>{{ 'mentor.report.mentor_review' | translate }}</h3>
              
              <div class="form-section">
                <label for="mentorContent">{{ 'mentor.report.comment_label' | translate }}</label>
                <textarea 
                  id="mentorContent"
                  pInputTextarea 
                  [(ngModel)]="formData.mentorContent"
                  [rows]="6"
                  [placeholder]="'mentor.report.comment_placeholder' | translate"
                  [maxlength]="4000"
                  [disabled]="saving">
                </textarea>
                <small class="char-counter">{{ formData.mentorContent.length }}/4000 {{ 'mentor.report.characters' | translate }}</small>
              </div>

              <div class="form-section checkbox-section">
                <div class="checkbox-container">
                  <p-checkbox 
                    [(ngModel)]="formData.isConfirmedByMentor"
                    [binary]="true"
                    inputId="confirmed"
                    [disabled]="saving">
                  </p-checkbox>
                  <label for="confirmed" class="checkbox-label">{{ 'mentor.report.confirm_reviewed' | translate }}</label>
                </div>
              </div>

              <div class="form-actions">
                <p-button 
                  [label]="'mentor.report.save' | translate"
                  icon="pi pi-save"
                  [loading]="saving"
                  (onClick)="saveReport()"
                  [disabled]="!isFormValid()">
                </p-button>
                <p-button 
                  [label]="'mentor.report.reset' | translate"
                  icon="pi pi-refresh"
                  severity="secondary"
                  [outlined]="true"
                  (onClick)="resetForm()"
                  [disabled]="saving">
                </p-button>
              </div>

              <div *ngIf="report.isConfirmedByMentor && report.confirmedAt" class="confirmation-info">
                <p><strong>{{ 'mentor.report.confirmed_on' | translate }}:</strong> {{ formatDate(report.confirmedAt) }}</p>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .download-actions {
      display: inline-block;
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

    .no-report-container {
      display: flex;
      justify-content: center;
    }

    .no-report-content {
      text-align: center;
      padding: 2rem;
    }

    .no-report-icon {
      font-size: 4rem;
      color: #ffc107;
      margin-bottom: 1rem;
    }

    .no-report-content h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
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

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section label {
      display: block;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 1rem;
    }

    .checkbox-section {
      margin: 2rem 0;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .checkbox-label {
      margin: 0;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-color);
      font-weight: 500;
    }

    .char-counter {
      display: block;
      text-align: right;
      color: #6c757d;
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .confirmation-info {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #d4edda;
      border-radius: 8px;
      color: #155724;
      font-size: 1rem;
    }

    textarea {
      width: 100%;
      resize: vertical;
      padding: 0.875rem;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      font-size: 1rem;
      line-height: 1.5;
    }

    textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(21, 50, 76, 0.25);
      outline: none;
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

      .form-actions {
        flex-direction: column;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .download-actions {
        display: block;
      }
    }
  `]
})
export class MentorReportComponent implements OnInit {
  internshipId: string = '';
  report: InternshipReport | null = null;
  loading = false;
  saving = false;
  downloadingPdf = false;

  formData = {
    mentorContent: '',
    isConfirmedByMentor: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: MentorReportService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private pdfDownloadService: PdfDownloadService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.internshipId = this.route.snapshot.paramMap.get('id') || '';
    if (this.internshipId) {
      this.loadReport();
    }
  }

  loadReport(): void {
    this.loading = true;
    this.reportService.getReport(this.internshipId).subscribe({
      next: (report) => {
        this.report = report;
        this.initializeForm();
        this.loading = false;
      },
      error: () => {
        // Report doesn't exist
        this.loading = false;
      }
    });
  }

  initializeForm(): void {
    if (this.report) {
      this.formData = {
        mentorContent: this.report.mentorContent || '',
        isConfirmedByMentor: this.report.isConfirmedByMentor
      };
    }
  }

  isFormValid(): boolean {
    return this.formData.mentorContent.trim().length > 0;
  }

  saveReport(): void {
    if (!this.isFormValid()) {
      this.showError(this.translationService.instant('common.required_field'));
      return;
    }

    this.saving = true;
    
    const request: UpdateInternshipReportRequest = {
      internshipId: this.internshipId,
      mentorContent: this.formData.mentorContent.trim(),
      grade: null, // Mentors don't grade, supervisors do
      isConfirmedByMentor: this.formData.isConfirmedByMentor
    };

    this.reportService.updateReport(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('mentor.report.save_success')
        });
        this.saving = false;
        this.loadReport(); // Reload to get updated data
      },
      error: () => {
        this.saving = false;
        this.showError(this.translationService.instant('mentor.report.save_error'));
      }
    });
  }

  resetForm(): void {
    this.confirmationService.confirm({
      message: this.translationService.instant('mentor.report.reset_confirm'),
      header: this.translationService.instant('mentor.report.reset_confirm_header'),
      acceptLabel: this.translationService.instant('mentor.report.reset'),
      rejectLabel: this.translationService.instant('common.cancel'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.initializeForm();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/mentor/students']);
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

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translationService.instant('common.error'),
      detail: message
    });
  }

  downloadPdf(): void {
    if (!this.report?.isConfirmedByMentor) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translationService.instant('common.warning'),
        detail: this.translationService.instant('common.pdf_confirmed_only')
      });
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
            detail: this.translationService.instant('common.pdf_downloaded')
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.instant('common.error'),
            detail: this.translationService.instant('common.pdf_download_error')
          });
        }
        this.downloadingPdf = false;
      },
      error: (error) => {
        this.downloadingPdf = false;
        if (error.status === 403) {
          this.messageService.add({
            severity: 'warn',
            summary: this.translationService.instant('common.warning'),
            detail: this.translationService.instant('common.pdf_confirmed_only')
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translationService.instant('common.error'),
            detail: this.translationService.instant('common.pdf_download_error')
          });
        }
      }
    });
  }
} 