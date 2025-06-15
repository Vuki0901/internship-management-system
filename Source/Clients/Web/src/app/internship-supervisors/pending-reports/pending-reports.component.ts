import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { 
  InternshipSupervisorService, 
  PendingReportInfo, 
  InternshipStatus, 
  StudyLevel
} from '../services/internship-supervisor.service';

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
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Čekaju ocjenu</h1>
        <p>Izvještaji koji čekaju vašu ocjenu</p>
      </header>

      <div class="content-wrapper">
        <p-card class="reports-card">
          <div class="reports-header">
            <h3>Izvještaji za ocjenjivanje ({{ pendingReports.length }})</h3>
            @if (pendingReports.length > 0) {
              <p class="priority-note">
                <i class="fa-solid fa-info-circle"></i>
                Izvještaji su poredani po datumu potvrde mentora
              </p>
            }
          </div>

          @if (loading) {
            <div class="loading-container">
              <p-progressSpinner></p-progressSpinner>
              <p>Učitavanje izvještaja...</p>
            </div>
          } @else if (pendingReports.length === 0) {
            <div class="no-reports">
              <i class="fa-solid fa-clipboard-check"></i>
              <h3>Nema izvještaja za ocjenjivanje</h3>
              <p>Trenutno nema izvještaja koji čekaju vašu ocjenu.</p>
            </div>
          } @else {
            <p-table [value]="pendingReports" [responsive]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>Student</th>
                  <th>Ponuditelj</th>
                  <th>Razina studija</th>
                  <th>Ukupno sati</th>
                  <th>Broj unosa</th>
                  <th>Potvrđeno</th>
                  <th>Mentor</th>
                  <th>Akcije</th>
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
                        {{ getDaysWaiting(report.confirmedAt) }} dana
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
                        label="Ocijeni" 
                        icon="pi pi-star" 
                        size="small"
                        severity="success"
                        (onClick)="gradeReport(report.internshipId)"
                        [style]="{'font-size': '0.8rem', 'margin-right': '0.5rem'}">
                      </p-button>
                      <p-button 
                        label="Pregled" 
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
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.showError('Greška pri učitavanju izvještaja.');
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
        case 'Undergraduate': return 'Preddiplomski';
        case 'Graduate': return 'Diplomski';
        default: return 'Nepoznato';
      }
    }
    
    // Handle numeric enum values
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return 'Preddiplomski';
      case StudyLevel.Graduate: return 'Diplomski';
      default: return 'Nepoznato';
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

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Greška',
      detail: message,
      life: 5000
    });
  }
} 