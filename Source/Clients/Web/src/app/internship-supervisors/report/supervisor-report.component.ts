import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InternshipSupervisorService, InternshipReport, InternshipStatus, StudyLevel } from '../services/internship-supervisor.service';
import { PdfDownloadService } from '../../shared/services/pdf-download.service';

@Component({
  selector: 'app-supervisor-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    ChipModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-actions">
          <p-button 
            label="Nazad na pregled praksi" 
            icon="pi pi-arrow-left" 
            severity="secondary"
            [outlined]="true"
            (onClick)="goBack()"
            [style]="{'margin-bottom': '1rem'}">
          </p-button>
          <div *ngIf="report?.isConfirmedByMentor" class="download-actions">
            <p-button 
              label="Preuzmi PDF"
              icon="pi pi-download"
              severity="success"
              [outlined]="true"
              [loading]="downloadingPdf"
              (onClick)="downloadPdf()"
              [style]="{'margin-left': '1rem', 'margin-bottom': '1rem'}">
            </p-button>
          </div>
        </div>
        <h1>Izvještaj o praksi</h1>
        <p>Pregled i ocjenjivanje izvještaja o praksi</p>
      </div>

      @if (loading) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color);"></i>
          <p>Učitavanje izvještaja...</p>
        </div>
      } @else if (report) {
        <div class="content-wrapper">
          <!-- Internship Information -->
          <p-card header="Informacije o praksi" [style]="{'margin-bottom': '1.5rem'}">
            <div class="info-grid">
              <div class="info-section">
                <h4>Student</h4>
                @if (report.internship.student) {
                  <div class="student-info">
                    <strong>{{ getStudentName(report.internship) }}</strong>
                    <small>{{ report.internship.student.emailAddress }}</small>
                  </div>
                } @else {
                  <span class="text-muted">Nepoznat student</span>
                }
              </div>

              <div class="info-section">
                <h4>Mentor</h4>
                @if (report.internship.mentor) {
                  <div class="mentor-info">
                    <strong>{{ getMentorName(report.internship) }}</strong>
                    <small>{{ report.internship.mentor.emailAddress }}</small>
                  </div>
                } @else {
                  <span class="text-muted">Nepoznat mentor</span>
                }
              </div>

              <div class="info-section">
                <h4>Ponuditelj prakse</h4>
                @if (report.internship.internshipProvider) {
                  <div class="provider-info">
                    <strong>{{ report.internship.internshipProvider.name }}</strong>
                    <small>{{ report.internship.internshipProvider.address }}</small>
                  </div>
                } @else {
                  <span class="text-muted">Nepoznat ponuditelj</span>
                }
              </div>

              <div class="info-section">
                <h4>Razina studija</h4>
                <p-chip 
                  [label]="getStudyLevelText(report.internship.studyLevel)"
                  [style]="getStudyLevelStyle(report.internship.studyLevel)">
                </p-chip>
              </div>

              <div class="info-section">
                <h4>Status prakse</h4>
                <p-chip 
                  [label]="getStatusText(report.internship.status)"
                  [style]="getStatusStyle(report.internship.status)">
                </p-chip>
              </div>

              <div class="info-section">
                <h4>Trajanje prakse</h4>
                <div class="date-range">
                  <span>{{ formatDate(report.internship.startDate) }}</span>
                  <i class="pi pi-arrow-right" style="margin: 0 0.5rem; color: #666;"></i>
                  <span>{{ formatDate(report.internship.endDate) }}</span>
                </div>
              </div>
            </div>
          </p-card>

          <!-- Report Statistics -->
          <p-card header="Statistike izvještaja" [style]="{'margin-bottom': '1.5rem'}">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ report.totalHoursWorked }}h</div>
                <div class="stat-label">Ukupno sati rada</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ report.totalLogEntries }}</div>
                <div class="stat-label">Broj unosa</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">
                  @if (report.isConfirmedByMentor) {
                    <i class="pi pi-check-circle" style="color: #28a745;"></i>
                    Potvrđen
                  } @else {
                    <i class="pi pi-times-circle" style="color: #dc3545;"></i>
                    Nepotvrđen
                  }
                </div>
                <div class="stat-label">Status mentora</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatDate(report.confirmedAt) }}</div>
                <div class="stat-label">Datum potvrde</div>
              </div>
            </div>
          </p-card>

          <!-- Mentor Content -->
          @if (report.mentorContent) {
            <p-card header="Komentar mentora" [style]="{'margin-bottom': '1.5rem'}">
              <div class="mentor-content">
                <p>{{ report.mentorContent }}</p>
              </div>
            </p-card>
          }

          <!-- Grading Section -->
          <p-card header="Ocjenjivanje" [style]="{'margin-bottom': '1.5rem'}">
            @if (report.grade) {
              <div class="existing-grade">
                <div class="grade-display">
                  <span class="grade-value">{{ report.grade }}</span>
                  <span class="grade-label">/ 5</span>
                </div>
                <p class="grade-info">Izvještaj je već ocijenjen.</p>
                <p-button 
                  label="Promijeni ocjenu" 
                  icon="pi pi-pencil" 
                  severity="warn"
                  [outlined]="true"
                  (onClick)="enableGrading()"
                  [style]="{'margin-top': '1rem'}">
                </p-button>
              </div>
            } @else {
              <div class="grading-form">
                @if (!report.isConfirmedByMentor) {
                  <div class="warning-message">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>Izvještaj još nije potvrđen od strane mentora. Možete ga ocijeniti tek nakon potvrde.</span>
                  </div>
                } @else {
                  <div class="grade-input-section">
                    <label>Odaberite ocjenu:</label>
                    <div class="grade-buttons">
                      @for (grade of [1, 2, 3, 4, 5]; track grade) {
                        <button 
                          type="button"
                          class="grade-button"
                          [class.selected]="selectedGrade === grade"
                          [class.grade-1]="grade === 1"
                          [class.grade-2]="grade === 2"
                          [class.grade-3]="grade === 3"
                          [class.grade-4]="grade === 4"
                          [class.grade-5]="grade === 5"
                          (click)="selectGrade(grade)"
                          [disabled]="grading">
                          <span class="grade-number">{{ grade }}</span>
                          <span class="grade-text">{{ getGradeText(grade) }}</span>
                        </button>
                      }
                    </div>
                    
                    <div class="grade-actions">
                      <p-button 
                        label="Ocijeni izvještaj" 
                        icon="pi pi-star" 
                        severity="success"
                        (onClick)="confirmGrading()"
                        [disabled]="!selectedGrade || grading"
                        [loading]="grading">
                      </p-button>
                    </div>
                  </div>
                }
              </div>
            }

            @if (showGradingForm && report.grade) {
              <p-divider></p-divider>
              <div class="grade-input-section">
                <label>Odaberite novu ocjenu:</label>
                <div class="grade-buttons">
                  @for (grade of [1, 2, 3, 4, 5]; track grade) {
                    <button 
                      type="button"
                      class="grade-button"
                      [class.selected]="selectedGrade === grade"
                      [class.grade-1]="grade === 1"
                      [class.grade-2]="grade === 2"
                      [class.grade-3]="grade === 3"
                      [class.grade-4]="grade === 4"
                      [class.grade-5]="grade === 5"
                      (click)="selectGrade(grade)"
                      [disabled]="grading">
                      <span class="grade-number">{{ grade }}</span>
                      <span class="grade-text">{{ getGradeText(grade) }}</span>
                    </button>
                  }
                </div>
                
                <div class="grade-actions">
                  <p-button 
                    label="Spremi novu ocjenu" 
                    icon="pi pi-save" 
                    severity="success"
                    (onClick)="confirmGrading()"
                    [disabled]="!selectedGrade || grading"
                    [loading]="grading"
                    [style]="{'margin-right': '0.5rem'}">
                  </p-button>
                  <p-button 
                    label="Odustani" 
                    icon="pi pi-times" 
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancelGrading()">
                  </p-button>
                </div>
              </div>
            }
          </p-card>
        </div>
      } @else {
        <div class="no-report">
          <i class="pi pi-file-excel" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
          <h3>Izvještaj nije dostupan</h3>
          <p>Izvještaj za ovu praksu nije pronađen ili nije dostupan za pregled.</p>
          <p-button 
            label="Nazad na pregled praksi" 
            icon="pi pi-arrow-left" 
            severity="secondary"
            (onClick)="goBack()">
          </p-button>
        </div>
      }
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

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .info-section h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .student-info, .mentor-info, .provider-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .student-info strong, .mentor-info strong, .provider-info strong {
      color: #333;
      font-size: 1rem;
    }

    .student-info small, .mentor-info small, .provider-info small {
      color: #666;
      font-size: 0.85rem;
    }

    .date-range {
      display: flex;
      align-items: center;
      font-size: 0.95rem;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }

    .mentor-content {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .mentor-content p {
      margin: 0;
      line-height: 1.6;
      color: #333;
    }

    .existing-grade {
      text-align: center;
      padding: 2rem;
    }

    .grade-display {
      margin-bottom: 1rem;
    }

    .grade-value {
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .grade-label {
      font-size: 1.5rem;
      color: #666;
      margin-left: 0.5rem;
    }

    .grade-info {
      color: #666;
      margin: 0 0 1rem 0;
    }

    .grading-form {
      padding: 1rem;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      color: #856404;
    }

    .warning-message i {
      font-size: 1.2rem;
      color: #f39c12;
    }

    .grade-input-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .grade-input-section label {
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
      display: block;
    }

    .grade-buttons {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .grade-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem 1.25rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 100px;
      font-family: inherit;
      position: relative;
      overflow: hidden;
    }

    .grade-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .grade-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .grade-button.selected {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
      box-shadow: 0 4px 12px rgba(21, 50, 76, 0.3);
    }

    .grade-number {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .grade-text {
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    /* Grade-specific colors */
    .grade-button.grade-1:not(.selected) {
      border-color: #dc3545;
      color: #dc3545;
    }

    .grade-button.grade-1:not(.selected):hover {
      background: #dc3545;
      color: white;
    }

    .grade-button.grade-2:not(.selected) {
      border-color: #fd7e14;
      color: #fd7e14;
    }

    .grade-button.grade-2:not(.selected):hover {
      background: #fd7e14;
      color: white;
    }

    .grade-button.grade-3:not(.selected) {
      border-color: #ffc107;
      color: #856404;
    }

    .grade-button.grade-3:not(.selected):hover {
      background: #ffc107;
      color: #856404;
    }

    .grade-button.grade-4:not(.selected) {
      border-color: #20c997;
      color: #20c997;
    }

    .grade-button.grade-4:not(.selected):hover {
      background: #20c997;
      color: white;
    }

    .grade-button.grade-5:not(.selected) {
      border-color: #28a745;
      color: #28a745;
    }

    .grade-button.grade-5:not(.selected):hover {
      background: #28a745;
      color: white;
    }

    .grade-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .no-report {
      text-align: center;
      padding: 3rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    .no-report h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .no-report p {
      margin: 0 0 1rem 0;
      line-height: 1.6;
    }

    .text-muted {
      color: #999;
      font-style: italic;
    }

    .download-actions {
      display: inline-block;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .grade-actions {
        flex-direction: column;
      }

      .grade-buttons {
        gap: 0.5rem;
      }

      .grade-button {
        min-width: 80px;
        padding: 0.75rem 1rem;
      }

      .grade-number {
        font-size: 1.25rem;
      }

      .grade-text {
        font-size: 0.75rem;
      }

      .download-actions {
        display: block;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class SupervisorReportComponent implements OnInit {
  report: InternshipReport | null = null;
  loading = false;
  downloadingPdf = false;
  grading = false;
  showGradingForm = false;
  selectedGrade: number | null = null;
  internshipId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supervisorService: InternshipSupervisorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private pdfDownloadService: PdfDownloadService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.internshipId = params['id'];
      if (this.internshipId) {
        this.loadReport();
      }
    });
  }

  loadReport(): void {
    this.loading = true;
    
    this.supervisorService.getInternshipReport(this.internshipId).subscribe({
      next: (report) => {
        this.report = report;
        this.selectedGrade = report.grade || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.loading = false;
        this.showError('Greška pri učitavanju izvještaja.');
      }
    });
  }

  enableGrading(): void {
    this.showGradingForm = true;
    this.selectedGrade = this.report?.grade || null;
  }

  cancelGrading(): void {
    this.showGradingForm = false;
    this.selectedGrade = this.report?.grade || null;
  }

  confirmGrading(): void {
    if (!this.selectedGrade || this.selectedGrade < 1 || this.selectedGrade > 5) {
      this.showError('Molimo unesite valjanu ocjenu između 1 i 5.');
      return;
    }

    const action = this.report?.grade ? 'promijeniti' : 'dodijeliti';
    const message = `Jeste li sigurni da želite ${action} ocjenu ${this.selectedGrade} za ovaj izvještaj?`;

    this.confirmationService.confirm({
      message: message,
      header: 'Potvrda ocjenjivanja',
      icon: 'pi pi-star',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.gradeReport();
      }
    });
  }

  gradeReport(): void {
    if (!this.selectedGrade) return;

    this.grading = true;
    
    this.supervisorService.gradeInternshipReport(this.internshipId, this.selectedGrade).subscribe({
      next: (response) => {
        this.grading = false;
        this.showGradingForm = false;
        this.showSuccess('Izvještaj je uspješno ocijenjen.');
        this.loadReport(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error grading report:', error);
        this.grading = false;
        this.showError('Greška pri ocjenjivanju izvještaja.');
      }
    });
  }

  goBack(): void {
    // Check if we came from pending reports or internships list
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['mode'] === 'grade') {
      this.router.navigate(['/supervisor/pending-reports']);
    } else {
      this.router.navigate(['/supervisor/internships']);
    }
  }

  // Helper methods
  getStudentName(internship: any): string {
    if (!internship.student) return 'Nepoznat student';
    
    const student = internship.student;
    return student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.emailAddress;
  }

  getMentorName(internship: any): string {
    if (!internship.mentor) return 'Nepoznat mentor';
    
    const mentor = internship.mentor;
    return mentor.fullName || `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() || mentor.emailAddress;
  }

  getStatusText(status: InternshipStatus | string | number): string {
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return 'Na čekanju';
        case 'Accepted': return 'Prihvaćeno';
        case 'Rejected': return 'Odbačeno';
        case 'Completed': return 'Završeno';
        default: return 'Nepoznato';
      }
    }
    
    const numericStatus = Number(status);
    switch (numericStatus) {
      case InternshipStatus.Pending: return 'Na čekanju';
      case InternshipStatus.Accepted: return 'Prihvaćeno';
      case InternshipStatus.Rejected: return 'Odbačeno';
      case InternshipStatus.Completed: return 'Završeno';
      default: return 'Nepoznato';
    }
  }

  getStatusStyle(status: InternshipStatus | string | number): any {
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return { 'background-color': '#ffc107', 'color': '#000' };
        case 'Accepted': return { 'background-color': '#28a745', 'color': '#fff' };
        case 'Rejected': return { 'background-color': '#dc3545', 'color': '#fff' };
        case 'Completed': return { 'background-color': '#17a2b8', 'color': '#fff' };
        default: return { 'background-color': '#6c757d', 'color': '#fff' };
      }
    }
    
    const numericStatus = Number(status);
    switch (numericStatus) {
      case InternshipStatus.Pending: return { 'background-color': '#ffc107', 'color': '#000' };
      case InternshipStatus.Accepted: return { 'background-color': '#28a745', 'color': '#fff' };
      case InternshipStatus.Rejected: return { 'background-color': '#dc3545', 'color': '#fff' };
      case InternshipStatus.Completed: return { 'background-color': '#17a2b8', 'color': '#fff' };
      default: return { 'background-color': '#6c757d', 'color': '#fff' };
    }
  }

  getStudyLevelText(level: StudyLevel | string | number): string {
    if (typeof level === 'string') {
      switch (level) {
        case 'Undergraduate': return 'Preddiplomski';
        case 'Graduate': return 'Diplomski';
        default: return 'Nepoznato';
      }
    }
    
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return 'Preddiplomski';
      case StudyLevel.Graduate: return 'Diplomski';
      default: return 'Nepoznato';
    }
  }

  getStudyLevelStyle(level: StudyLevel | string | number): any {
    if (typeof level === 'string') {
      switch (level) {
        case 'Undergraduate': return { 'background-color': '#007bff', 'color': '#fff' };
        case 'Graduate': return { 'background-color': '#6f42c1', 'color': '#fff' };
        default: return { 'background-color': '#6c757d', 'color': '#fff' };
      }
    }
    
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return { 'background-color': '#007bff', 'color': '#fff' };
      case StudyLevel.Graduate: return { 'background-color': '#6f42c1', 'color': '#fff' };
      default: return { 'background-color': '#6c757d', 'color': '#fff' };
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hr-HR');
    } catch {
      return '-';
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Uspjeh',
      detail: message,
      life: 5000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Greška',
      detail: message,
      life: 5000
    });
  }

  selectGrade(grade: number): void {
    this.selectedGrade = grade;
  }

  getGradeText(grade: number): string {
    switch (grade) {
      case 1: return 'Nedovoljan';
      case 2: return 'Dovoljan';
      case 3: return 'Dobar';
      case 4: return 'Vrlo dobar';
      case 5: return 'Odličan';
      default: return 'Nepoznato';
    }
  }

  downloadPdf(): void {
    if (!this.report?.isConfirmedByMentor) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'PDF se može preuzeti samo za potvrđene izvještaje.'
      });
      return;
    }

    this.downloadingPdf = true;
    
    this.supervisorService.downloadInternshipReportPdf(this.internshipId).subscribe({
      next: (pdfResponse) => {
        try {
          this.pdfDownloadService.downloadPdf(pdfResponse);
          this.messageService.add({
            severity: 'success',
            summary: 'Uspjeh',
            detail: 'PDF izvještaj je uspješno preuzet.'
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Greška',
            detail: 'Greška pri preuzimanju PDF-a.'
          });
        }
        this.downloadingPdf = false;
      },
      error: (error) => {
        this.downloadingPdf = false;
        if (error.status === 403) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Upozorenje',
            detail: 'PDF se može preuzeti samo za potvrđene izvještaje.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Greška',
            detail: 'Greška pri preuzimanju PDF izvještaja.'
          });
        }
      }
    });
  }
}
