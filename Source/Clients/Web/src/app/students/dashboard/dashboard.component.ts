import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { 
  InternshipsService, 
  InternshipInformation, 
  InternshipStatus,
  StudyLevel
} from '../services/internships.service';
import { 
  InternshipLogService, 
  InternshipLogEntry,
  InternshipLogStatus 
} from '../services/internship-log.service';
import { 
  InternshipReportService,
  InternshipReport 
} from '../services/internship-report.service';

// Parsing functions for enum handling
function parseInternshipStatus(status: any): InternshipStatus {
  if (typeof status === 'string') {
    switch (status) {
      case 'Pending': return InternshipStatus.Pending;
      case 'Accepted': return InternshipStatus.Accepted;
      case 'Rejected': return InternshipStatus.Rejected;
      case 'Completed': return InternshipStatus.Completed;
      default: return InternshipStatus.Pending;
    }
  }
  return Number(status) || InternshipStatus.Pending;
}

function parseStudyLevel(level: any): StudyLevel {
  if (typeof level === 'string') {
    switch (level) {
      case 'Undergraduate': return StudyLevel.Undergraduate;
      case 'Graduate': return StudyLevel.Graduate;
      default: return StudyLevel.Undergraduate;
    }
  }
  return Number(level) || StudyLevel.Undergraduate;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ChipModule,
    DividerModule,
    ToastModule,
    SkeletonModule,
    ProgressBarModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Studentski portal</h1>
        <p>Dobrodošli u sustav za upravljanje stručnom praksom</p>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading-grid">
          <p-card *ngFor="let item of [1,2,3,4]" [style]="{'margin-bottom': '1.5rem'}">
            <p-skeleton height="2rem" [style]="{'margin-bottom': '1rem'}"></p-skeleton>
            <p-skeleton height="4rem" [style]="{'margin-bottom': '1rem'}"></p-skeleton>
            <p-skeleton height="1rem"></p-skeleton>
          </p-card>
        </div>
      } @else {
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card primary">
              <div class="stat-icon">
                <i class="pi pi-briefcase"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalInternships }}</div>
                <div class="stat-label">Ukupno praksi</div>
                <div class="stat-sublabel">Sve vaše prijave</div>
              </div>
            </div>
          </p-card>

          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card success">
              <div class="stat-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ activeInternships }}</div>
                <div class="stat-label">Aktivne prakse</div>
                <div class="stat-sublabel">Prihvaćene i u tijeku</div>
              </div>
            </div>
          </p-card>

          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalLogEntries }}</div>
                <div class="stat-label">Dnevnik unosa</div>
                <div class="stat-sublabel">Ukupno zapisa</div>
              </div>
            </div>
          </p-card>

          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card info">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalHoursWorked }}</div>
                <div class="stat-label">Sati rada</div>
                <div class="stat-sublabel">Ukupno odrađeno</div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Current Internship Progress -->
        @if (currentInternship) {
          <p-card header="Trenutna praksa" [style]="{'margin-bottom': '1.5rem'}">
            <div class="current-internship">
              <div class="internship-header">
                <div class="internship-info">
                  <h3>{{ currentInternship.internshipProvider?.name || 'Nepoznat ponuditelj' }}</h3>
                  <div class="internship-details">
                    <p-chip 
                      [label]="getStatusText(currentInternship.status)"
                      [style]="getStatusStyle(currentInternship.status)"
                      [style]="{'margin-right': '0.5rem'}">
                    </p-chip>
                    <p-chip 
                      [label]="getStudyLevelText(currentInternship.studyLevel)"
                      [style]="getStudyLevelStyle(currentInternship.studyLevel)">
                    </p-chip>
                  </div>
                </div>
                <div class="internship-actions">
                  <p-button 
                    label="Dnevnik"
                    icon="pi pi-book"
                    severity="primary"
                    [outlined]="true"
                    (onClick)="navigateToInternshipLogs()"
                    [style]="{'margin-right': '0.5rem'}">
                  </p-button>
                  @if (currentInternship.status === InternshipStatus.Completed && currentReport) {
                    <p-button 
                      label="Izvještaj"
                      icon="pi pi-file-text"
                      severity="info"
                      [outlined]="true"
                      (onClick)="navigateToReport(currentInternship.id)">
                    </p-button>
                  }
                </div>
              </div>
              
              @if (currentInternship.startDate && currentInternship.endDate) {
                <div class="internship-timeline">
                  <div class="timeline-info">
                    <span class="timeline-label">Početak:</span>
                    <span>{{ formatDate(currentInternship.startDate) }}</span>
                  </div>
                  <div class="timeline-progress">
                    <p-progressBar 
                      [value]="getInternshipProgress()" 
                      [style]="{'height': '8px', 'border-radius': '4px'}">
                    </p-progressBar>
                    <div class="progress-text">{{ getInternshipProgress() }}% završeno</div>
                  </div>
                  <div class="timeline-info">
                    <span class="timeline-label">Završetak:</span>
                    <span>{{ formatDate(currentInternship.endDate) }}</span>
                  </div>
                </div>
              }

              @if (currentReport) {
                <p-divider></p-divider>
                <div class="report-summary">
                  <h4>Sažetak izvještaja</h4>
                  <div class="report-stats">
                    <div class="report-stat">
                      <span class="report-stat-value">{{ currentReport.totalHoursWorked }}</span>
                      <span class="report-stat-label">Sati rada</span>
                    </div>
                    <div class="report-stat">
                      <span class="report-stat-value">{{ currentReport.totalLogEntries }}</span>
                      <span class="report-stat-label">Unosa u dnevnik</span>
                    </div>
                    @if (currentReport.grade) {
                      <div class="report-stat">
                        <span class="report-stat-value grade">{{ currentReport.grade }}</span>
                        <span class="report-stat-label">Ocjena</span>
                      </div>
                    }
                    <div class="report-stat">
                      <span class="report-stat-value" [class]="currentReport.isConfirmedByMentor ? 'confirmed' : 'pending'">
                        {{ currentReport.isConfirmedByMentor ? 'DA' : 'NE' }}
                      </span>
                      <span class="report-stat-label">Potvrđeno</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </p-card>
        }

        <!-- Quick Actions -->
        <p-card header="Brze akcije" [style]="{'margin-bottom': '1.5rem'}">
          <div class="quick-actions">
            <p-button 
              label="Sve prakse"
              icon="pi pi-briefcase"
              severity="primary"
              [outlined]="true"
              (onClick)="navigateToInternships()"
              [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
            </p-button>
            @if (currentInternship) {
              <p-button 
                label="Dnevnik prakse"
                icon="pi pi-book"
                severity="secondary"
                [outlined]="true"
                (onClick)="navigateToInternshipLogs()"
                [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
              </p-button>
            }
            <p-button 
              label="Dokumenti"
              icon="pi pi-file"
              severity="info"
              [outlined]="true"
              (onClick)="navigateToDocuments()"
              [style]="{'margin-bottom': '0.5rem'}">
            </p-button>
          </div>
        </p-card>

        <!-- Recent Activity -->
        @if (recentLogEntries.length > 0) {
          <p-card header="Nedavni unosi u dnevnik" [style]="{'margin-bottom': '1.5rem'}">
            <div class="recent-logs">
              @for (log of recentLogEntries; track log.id) {
                <div class="log-entry">
                  <div class="log-date">
                    <div class="log-day">{{ formatLogDate(log.date) }}</div>
                    <div class="log-hours">{{ log.numberOfWorkingHours }}h</div>
                  </div>
                  <div class="log-content">
                    <div class="log-description">{{ log.description }}</div>
                    <div class="log-meta">
                      <p-chip 
                        [label]="getLogStatusText(log.status)"
                        [style]="getLogStatusStyle(log.status)"
                        size="small">
                      </p-chip>
                      <span class="log-location">{{ getLocationText(log.location) }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            <p-divider></p-divider>
            <div class="view-all-section">
              <p-button 
                label="Prikaži sve unose"
                icon="pi pi-arrow-right"
                severity="primary"
                [text]="true"
                (onClick)="navigateToInternshipLogs()">
              </p-button>
            </div>
          </p-card>
        }

        <!-- All Internships Overview -->
        @if (allInternships.length > 0) {
          <p-card header="Pregled svih praksi" [style]="{'margin-bottom': '1.5rem'}">
            <div class="internships-overview">
              @for (internship of allInternships; track internship.id) {
                <div class="internship-card">
                  <div class="internship-card-header">
                    <div class="internship-card-info">
                      <h4>{{ internship.internshipProvider?.name || 'Nepoznat ponuditelj' }}</h4>
                      <span class="internship-date">{{ formatDate(internship.createdOn) }}</span>
                    </div>
                    <p-chip 
                      [label]="getStatusText(internship.status)"
                      [style]="getStatusStyle(internship.status)">
                    </p-chip>
                  </div>
                  <div class="internship-card-details">
                    @if (internship.startDate) {
                      <span><strong>Početak:</strong> {{ formatDate(internship.startDate) }}</span>
                    }
                    @if (internship.endDate) {
                      <span><strong>Završetak:</strong> {{ formatDate(internship.endDate) }}</span>
                    }
                    <span><strong>Razina:</strong> {{ getStudyLevelText(internship.studyLevel) }}</span>
                  </div>
                  <div class="internship-card-actions">
                    @if (internship.status === InternshipStatus.Accepted || internship.status === InternshipStatus.Completed) {
                      <p-button 
                        icon="pi pi-book"
                        size="small"
                        severity="info"
                        [text]="true"
                        pTooltip="Dnevnik prakse"
                        (onClick)="navigateToInternshipLogs()">
                      </p-button>
                    }
                    @if (internship.status === InternshipStatus.Completed) {
                      <p-button 
                        icon="pi pi-file-text"
                        size="small"
                        severity="secondary"
                        [text]="true"
                        pTooltip="Izvještaj"
                        (onClick)="navigateToReport(internship.id)">
                      </p-button>
                    }
                  </div>
                </div>
              }
            </div>
            <p-divider></p-divider>
            <div class="view-all-section">
              <p-button 
                label="Upravljaj praksama"
                icon="pi pi-arrow-right"
                severity="primary"
                [text]="true"
                (onClick)="navigateToInternships()">
              </p-button>
            </div>
          </p-card>
        }

        <!-- Empty State -->
        @if (!loading && totalInternships === 0) {
          <p-card>
            <div class="empty-state">
              <i class="pi pi-briefcase empty-icon"></i>
              <h3>Dobrodošli u studentski portal!</h3>
              <p>Trenutno nemate prijavljenih praksi.</p>
              <p>Počnite s pretraživanjem dostupnih ponuditelja prakse i prijavite se za praksu koja vam odgovara.</p>
              <p-button 
                label="Pretraži prakse"
                icon="pi pi-search"
                severity="primary"
                (onClick)="navigateToInternships()">
              </p-button>
            </div>
          </p-card>
        }
      }
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

    .loading-grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .stats-grid {
      max-width: 1400px;
      margin: 0 auto 2rem auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0;
    }

    .stat-icon {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      flex-shrink: 0;
    }

    .stat-card.primary .stat-icon {
      background: linear-gradient(135deg, var(--primary-color), #1e3a5f);
    }

    .stat-card.success .stat-icon {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .stat-card.warning .stat-icon {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
    }

    .stat-card.info .stat-icon {
      background: linear-gradient(135deg, #17a2b8, #6f42c1);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .stat-sublabel {
      font-size: 0.9rem;
      color: #666;
    }

    .current-internship {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .internship-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .internship-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--primary-color);
      font-size: 1.3rem;
    }

    .internship-details {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .internship-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .internship-timeline {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .timeline-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-align: center;
    }

    .timeline-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .timeline-progress {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-text {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    .report-summary h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .report-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .report-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }

    .report-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.25rem;
    }

    .report-stat-value.grade {
      color: #28a745;
    }

    .report-stat-value.confirmed {
      color: #28a745;
    }

    .report-stat-value.pending {
      color: #ffc107;
    }

    .report-stat-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .recent-logs {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .log-entry {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .log-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      text-align: center;
    }

    .log-day {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 0.9rem;
    }

    .log-hours {
      font-size: 0.8rem;
      color: #666;
      background: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      margin-top: 0.25rem;
    }

    .log-content {
      flex: 1;
    }

    .log-description {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .log-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .log-location {
      font-size: 0.8rem;
      color: #666;
    }

    .internships-overview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .internship-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .internship-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .internship-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .internship-card-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--primary-color);
      font-size: 1.1rem;
    }

    .internship-date {
      font-size: 0.8rem;
      color: #666;
    }

    .internship-card-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .internship-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .view-all-section {
      text-align: center;
      margin-top: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .empty-state p {
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        gap: 1rem;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .internship-header {
        flex-direction: column;
        align-items: stretch;
      }

      .internship-actions {
        justify-content: flex-start;
      }

      .internship-timeline {
        grid-template-columns: 1fr;
        gap: 1rem;
        text-align: center;
      }

      .timeline-info {
        flex-direction: row;
        justify-content: space-between;
      }

      .report-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .log-entry {
        flex-direction: column;
        gap: 0.5rem;
      }

      .log-date {
        flex-direction: row;
        justify-content: space-between;
        min-width: auto;
      }

      .internships-overview {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }
    }

    /* Card styling improvements */
    :host ::ng-deep .p-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
      border-radius: 12px;
    }

    :host ::ng-deep .p-card .p-card-header {
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      border-bottom: 1px solid #e9ecef;
      font-weight: 600;
      color: var(--primary-color);
    }

    :host ::ng-deep .p-card .p-card-content {
      padding: 1.5rem;
    }

    /* All cards in the main content area */
    .stats-grid > :host ::ng-deep .p-card,
    .page-container > :host ::ng-deep .p-card {
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  loading = true;
  
  // Statistics
  totalInternships = 0;
  activeInternships = 0;
  totalLogEntries = 0;
  totalHoursWorked = 0;

  // Data
  allInternships: InternshipInformation[] = [];
  currentInternship: InternshipInformation | null = null;
  currentReport: InternshipReport | null = null;
  recentLogEntries: InternshipLogEntry[] = [];

  // Enums for template
  InternshipStatus = InternshipStatus;
  StudyLevel = StudyLevel;

  constructor(
    private internshipsService: InternshipsService,
    private internshipLogService: InternshipLogService,
    private internshipReportService: InternshipReportService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    this.loading = true;
    
    try {
      // Load internships first
      await this.loadInternships();
      
      // Load additional data if we have internships
      if (this.currentInternship) {
        await Promise.all([
          this.loadCurrentReport(),
          this.loadRecentLogs()
        ]);
      }
      
      this.calculateStatistics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Greška pri učitavanju podataka.');
    } finally {
      this.loading = false;
    }
  }

  private loadInternships(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.internshipsService.getInternships().subscribe({
        next: (response) => {
          // Convert string enum values to numeric for consistency
          this.allInternships = response.internships.map(internship => ({
            ...internship,
            status: parseInternshipStatus(internship.status),
            studyLevel: parseStudyLevel(internship.studyLevel)
          }));
          
          this.totalInternships = this.allInternships.length;
          this.activeInternships = this.allInternships.filter(i => 
            i.status === InternshipStatus.Accepted || i.status === InternshipStatus.Completed
          ).length;
          
          // Find current active internship
          this.currentInternship = this.allInternships.find(i => 
            i.status === InternshipStatus.Accepted || i.status === InternshipStatus.Completed
          ) || null;
          
          resolve();
        },
        error: (error) => {
          console.error('Error loading internships:', error);
          reject(error);
        }
      });
    });
  }

  private loadCurrentReport(): Promise<void> {
    if (!this.currentInternship) return Promise.resolve();
    
    return new Promise((resolve) => {
      this.internshipReportService.getReport(this.currentInternship!.id).subscribe({
        next: (report) => {
          this.currentReport = report;
          resolve();
        },
        error: (error) => {
          console.error('Error loading report:', error);
          // Don't reject, just resolve without report
          resolve();
        }
      });
    });
  }

  private loadRecentLogs(): Promise<void> {
    if (!this.currentInternship) return Promise.resolve();
    
    return new Promise((resolve) => {
      this.internshipLogService.getInternshipLogs().subscribe({
        next: (response) => {
          this.recentLogEntries = response.internshipLogs
            .sort((a: InternshipLogEntry, b: InternshipLogEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5); // Show only recent 5
          resolve();
        },
        error: (error) => {
          console.error('Error loading logs:', error);
          // Don't reject, just resolve without logs
          resolve();
        }
      });
    });
  }

  private calculateStatistics(): void {
    // Calculate total log entries and hours from recent logs
    this.totalLogEntries = this.recentLogEntries.length;
    this.totalHoursWorked = this.recentLogEntries.reduce((total, log) => total + log.numberOfWorkingHours, 0);
    
    // If we have a report, use its more accurate data
    if (this.currentReport) {
      this.totalLogEntries = this.currentReport.totalLogEntries;
      this.totalHoursWorked = this.currentReport.totalHoursWorked;
    }
  }

  // Navigation methods
  navigateToInternships(): void {
    this.router.navigate(['/student/internships']);
  }

  navigateToInternshipLogs(): void {
    this.router.navigate(['/student/internship']);
  }

  navigateToDocuments(): void {
    this.router.navigate(['/student/documents']);
  }

  navigateToReport(internshipId: string): void {
    this.router.navigate(['/student/internships', internshipId, 'report']);
  }

  // Helper methods
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

  getLogStatusText(status: InternshipLogStatus | string): string {
    const numericStatus = typeof status === 'string' ? parseInt(status) : status;
    switch (numericStatus) {
      case InternshipLogStatus.Complete: return 'Završeno';
      case InternshipLogStatus.InProgress: return 'U tijeku';
      case InternshipLogStatus.Unfinished: return 'Nedovršeno';
      default: return 'Nepoznato';
    }
  }

  getLogStatusStyle(status: InternshipLogStatus | string): any {
    const numericStatus = typeof status === 'string' ? parseInt(status) : status;
    switch (numericStatus) {
      case InternshipLogStatus.Complete: return { 'background-color': '#28a745', 'color': '#fff' };
      case InternshipLogStatus.InProgress: return { 'background-color': '#ffc107', 'color': '#000' };
      case InternshipLogStatus.Unfinished: return { 'background-color': '#dc3545', 'color': '#fff' };
      default: return { 'background-color': '#6c757d', 'color': '#fff' };
    }
  }

  getLocationText(location: number | string): string {
    const numericLocation = typeof location === 'string' ? parseInt(location) : location;
    // Based on WorkLocation enum from the service
    switch (numericLocation) {
      case 1: return 'Na lokaciji';
      case 2: return 'Udaljeno';
      case 3: return 'Hibridno';
      default: return 'Nepoznato';
    }
  }

  getInternshipProgress(): number {
    if (!this.currentInternship?.startDate || !this.currentInternship?.endDate) {
      return 0;
    }

    const start = new Date(this.currentInternship.startDate);
    const end = new Date(this.currentInternship.endDate);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
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

  formatLogDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hr-HR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch {
      return '-';
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