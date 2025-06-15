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
import { InternshipReportService, InternshipReport } from '../services/internship-report.service';
import { InternshipsService, InternshipInformation, InternshipStatus } from '../services/internships.service';
import { PdfDownloadService } from '../../shared/services/pdf-download.service';

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
    DividerModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Izvještaj o praksi</h1>
        <p-button 
          label="Nazad na pregled praksi"
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
          <p>Učitavanje...</p>
        </div>

        <!-- No Report State -->
        <div *ngIf="!loading && !report && internship && canGenerateReport" class="no-report-container">
          <p-card>
            <div class="no-report-content">
              <i class="pi pi-file-export no-report-icon"></i>
              <h2>Generiraj izvještaj o praksi</h2>
              <p>Praksa je završena i možete generirati izvještaj. Izvještaj će automatski uključiti podatke iz vašeg dnevnika prakse.</p>
              
              <div class="internship-summary">
                <h3>Pregled prakse:</h3>
                <div class="summary-item">
                  <strong>Tvrtka:</strong> {{ internship.internshipProvider?.name }}
                </div>
                <div class="summary-item">
                  <strong>Studij:</strong> {{ getStudyLevelText(internship.studyLevel) }}
                </div>
                <div class="summary-item">
                  <strong>Status:</strong> 
                  <p-chip [label]="getStatusText(internship.status)" [style]="{'background-color': '#d4edda', 'color': '#155724'}"></p-chip>
                </div>
              </div>

              <p-button 
                label="Generiraj izvještaj"
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
              <h2>Izvještaj o praksi</h2>
              <div class="report-meta">
                <span class="creation-date">Kreiran: {{ formatDate(report.createdOn) }}</span>
                <p-chip 
                  [label]="report.isConfirmedByMentor ? 'Potvrđen od mentora' : 'Čeka potvrdu mentora'"
                  [style]="getConfirmationChipStyle(report.isConfirmedByMentor)">
                </p-chip>
                <div *ngIf="report.isConfirmedByMentor" class="download-actions">
                  <p-button 
                    label="Preuzmi PDF"
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
              <h3>Automatski podaci iz dnevnika</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalHoursWorked }}</div>
                  <div class="stat-label">Ukupno radnih sati</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ report.totalLogEntries }}</div>
                  <div class="stat-label">Broj unosa u dnevnik</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ getAverageHours() }}</div>
                  <div class="stat-label">Prosjek sati po danu</div>
                </div>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Mentor Content Section -->
            <div class="report-section">
              <h3>Ocjena mentora</h3>
              <div *ngIf="report.mentorContent && report.mentorContent.trim().length > 0" class="mentor-content">
                <h4>Komentar mentora:</h4>
                <div class="content-box">{{ report.mentorContent }}</div>
              </div>
              <div *ngIf="!report.mentorContent || report.mentorContent.trim().length === 0" class="no-content">
                <p>Mentor još nije dodao komentar.</p>
              </div>

              <div class="grade-section">
                <h4>Ocjena:</h4>
                <div *ngIf="report.grade" class="grade-display">
                  <span class="grade-value">{{ report.grade }}</span>
                  <span class="grade-max">/5</span>
                  <span class="grade-text">({{ getGradeText(report.grade) }})</span>
                </div>
                <div *ngIf="!report.grade" class="no-grade">
                  <p>Ocjena još nije dodijeljena.</p>
                </div>
              </div>

              <div *ngIf="report.isConfirmedByMentor && report.confirmedAt" class="confirmation-info">
                <p><strong>Potvrđeno od mentora:</strong> {{ formatDate(report.confirmedAt) }}</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !report && !canGenerateReport" class="error-container">
          <p-card>
            <div class="error-content">
              <i class="pi pi-exclamation-triangle error-icon"></i>
              <h2>Izvještaj nije dostupan</h2>
              <p>Izvještaj možete generirati samo nakon završetka prakse.</p>
              <p-button 
                label="Nazad na pregled praksi"
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
    private pdfDownloadService: PdfDownloadService
  ) {}

  ngOnInit(): void {
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
        this.showError('Greška pri učitavanju podataka o praksi.');
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
          summary: 'Uspjeh',
          detail: 'Izvještaj je uspješno generiran.'
        });
        this.generating = false;
        this.loadReport(); // Reload to show the new report
      },
      error: () => {
        this.generating = false;
        this.showError('Greška pri generiranju izvještaja.');
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
      case 5: return 'Odličan';
      case 4: return 'Vrlo dobar';
      case 3: return 'Dobar';
      case 2: return 'Dovoljan';
      case 1: return 'Nedovoljan';
      default: return '';
    }
  }

  getStudyLevelText(level: any): string {
    if (!level) return 'Nepoznato';
    
    // Handle both string and numeric values
    const levelStr = String(level).toLowerCase();
    switch (levelStr) {
      case '1':
      case 'undergraduate':
        return 'Preddiplomski';
      case '2':
      case 'graduate':
        return 'Diplomski';
      default:
        return 'Nepoznato';
    }
  }

  getStatusText(status: any): string {
    if (!status) return 'Nepoznato';
    
    // Handle both string and numeric values
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case '1':
      case 'pending':
        return 'Na čekanju';
      case '2':
      case 'accepted':
        return 'Prihvaćena';
      case '3':
      case 'rejected':
        return 'Odbijena';
      case '4':
      case 'completed':
        return 'Završena';
      default:
        return 'Nepoznato';
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
      summary: 'Greška',
      detail: message
    });
  }

  downloadPdf(): void {
    if (!this.report?.isConfirmedByMentor) {
      this.showError('PDF se može preuzeti samo za potvrđene izvještaje.');
      return;
    }

    this.downloadingPdf = true;
    
    this.reportService.downloadReportPdf(this.internshipId).subscribe({
      next: (pdfResponse) => {
        try {
          this.pdfDownloadService.downloadPdf(pdfResponse);
          this.messageService.add({
            severity: 'success',
            summary: 'Uspjeh',
            detail: 'PDF izvještaj je uspješno preuzet.'
          });
        } catch (error) {
          this.showError('Greška pri preuzimanju PDF-a.');
        }
        this.downloadingPdf = false;
      },
      error: (error) => {
        this.downloadingPdf = false;
        if (error.status === 403) {
          this.showError('PDF se može preuzeti samo za potvrđene izvještaje.');
        } else {
          this.showError('Greška pri preuzimanju PDF izvještaja.');
        }
      }
    });
  }
} 