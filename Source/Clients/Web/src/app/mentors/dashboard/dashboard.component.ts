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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { 
  MentorService, 
  AssignedInternshipInfo, 
  InternshipApplicationInfo,
  InternshipStatus,
  StudyLevel,
  parseInternshipStatus,
  parseStudyLevel
} from '../services/mentor.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-mentor-dashboard',
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
    TooltipModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ companyName }}</h1>
        <p>{{ 'dashboard.welcome_message' | translate }}</p>
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
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalStudents }}</div>
                <div class="stat-label">{{ 'dashboard.total_students' | translate }}</div>
                <div class="stat-sublabel">{{ 'dashboard.all_assigned_students' | translate }}</div>
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
                <div class="stat-label">{{ 'dashboard.active_internships' | translate }}</div>
                <div class="stat-sublabel">{{ 'dashboard.accepted_and_completed' | translate }}</div>
              </div>
            </div>
          </p-card>

          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pendingApplications }}</div>
                <div class="stat-label">{{ 'dashboard.pending_approval' | translate }}</div>
                <div class="stat-sublabel">{{ 'dashboard.new_internship_requests' | translate }}</div>
              </div>
            </div>
          </p-card>

          <p-card [style]="{'margin-bottom': '1.5rem'}">
            <div class="stat-card info">
              <div class="stat-icon">
                <i class="pi pi-file-edit"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ reportsToReview }}</div>
                <div class="stat-label">{{ 'dashboard.reports_to_review' | translate }}</div>
                <div class="stat-sublabel">{{ 'dashboard.completed_internships' | translate }}</div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <p-card [header]="'dashboard.quick_actions' | translate" [style]="{'margin-bottom': '1.5rem'}">
          <div class="quick-actions">
            <p-button 
              [label]="'dashboard.review_requests' | translate"
              icon="pi pi-inbox"
              severity="primary"
              [outlined]="true"
              (onClick)="navigateToApplications()"
              [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
            </p-button>
            <p-button 
              [label]="'dashboard.my_students' | translate"
              icon="pi pi-users"
              severity="secondary"
              [outlined]="true"
              (onClick)="navigateToStudents()"
              [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
            </p-button>
            <p-button 
              [label]="'dashboard.documents' | translate"
              icon="pi pi-file"
              severity="info"
              [outlined]="true"
              (onClick)="navigateToDocuments()"
              [style]="{'margin-bottom': '0.5rem'}">
            </p-button>
          </div>
        </p-card>

        <!-- Recent Applications -->
        @if (recentApplications.length > 0) {
          <p-card [header]="'dashboard.recent_applications' | translate" [style]="{'margin-bottom': '1.5rem'}">
            <div class="applications-list">
              @for (application of recentApplications; track application.id) {
                <div class="application-item">
                  <div class="application-info">
                    <div class="student-name">
                      <i class="pi pi-user" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
                      <strong>{{ getStudentName(application) }}</strong>
                    </div>
                    <div class="application-details">
                      <p-chip 
                        [label]="getStudyLevelText(application.studyLevel)"
                        [style]="getStudyLevelStyle(application.studyLevel)"
                        [style]="{'margin-right': '0.5rem'}">
                      </p-chip>
                      <span class="application-date">{{ formatDate(application.createdOn) }}</span>
                    </div>
                  </div>
                  <div class="application-actions">
                    <p-button 
                      [label]="'dashboard.view' | translate"
                      icon="pi pi-eye"
                      size="small"
                      severity="secondary"
                      [outlined]="true"
                      (onClick)="viewApplication(application)">
                    </p-button>
                  </div>
                </div>
              }
            </div>
            <p-divider></p-divider>
            <div class="view-all-section">
              <p-button 
                [label]="'dashboard.show_all_requests' | translate"
                icon="pi pi-arrow-right"
                severity="primary"
                [text]="true"
                (onClick)="navigateToApplications()">
              </p-button>
            </div>
          </p-card>
        }

        <!-- Current Students -->
        @if (currentStudents.length > 0) {
          <p-card [header]="'dashboard.current_students' | translate" [style]="{'margin-bottom': '1.5rem'}">
            <div class="students-grid">
              @for (student of currentStudents; track student.id) {
                <div class="student-card">
                  <div class="student-header">
                    <div class="student-avatar">
                      <i class="pi pi-user"></i>
                    </div>
                    <div class="student-info">
                      <div class="student-name">{{ getStudentName(student) }}</div>
                      <div class="student-email">{{ student.student?.emailAddress || '-' }}</div>
                    </div>
                  </div>
                  <div class="student-details">
                    <div class="detail-row">
                      <span class="detail-label">{{ 'dashboard.status' | translate }}:</span>
                      <p-chip 
                        [label]="getStatusText(student.status)"
                        [style]="getStatusStyle(student.status)">
                      </p-chip>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">{{ 'dashboard.level' | translate }}:</span>
                      <p-chip 
                        [label]="getStudyLevelText(student.studyLevel)"
                        [style]="getStudyLevelStyle(student.studyLevel)">
                      </p-chip>
                    </div>
                    @if (student.startDate) {
                      <div class="detail-row">
                        <span class="detail-label">{{ 'dashboard.start_date' | translate }}:</span>
                        <span>{{ formatDate(student.startDate) }}</span>
                      </div>
                    }
                  </div>
                  <div class="student-actions">
                    <p-button 
                      icon="pi pi-eye"
                      size="small"
                      severity="info"
                      [text]="true"
                      [pTooltip]="'dashboard.show_details' | translate"
                      (onClick)="viewStudentDetails(student)">
                    </p-button>
                    @if (student.status === 4) {
                      <p-button 
                        icon="pi pi-file-edit"
                        size="small"
                        severity="warn"
                        [text]="true"
                        [pTooltip]="'dashboard.review_report' | translate"
                        (onClick)="viewReport(student)">
                      </p-button>
                    }
                  </div>
                </div>
              }
            </div>
            <p-divider></p-divider>
            <div class="view-all-section">
              <p-button 
                [label]="'dashboard.show_all_students' | translate"
                icon="pi pi-arrow-right"
                severity="primary"
                [text]="true"
                (onClick)="navigateToStudents()">
              </p-button>
            </div>
          </p-card>
        }

        <!-- Empty State -->
        @if (!loading && totalStudents === 0 && pendingApplications === 0) {
          <p-card>
            <div class="empty-state">
              <i class="pi pi-users empty-icon"></i>
              <h3>{{ 'dashboard.welcome_portal' | translate }}</h3>
              <p>{{ 'dashboard.no_students_assigned' | translate }}</p>
              <p>{{ 'dashboard.requests_will_appear' | translate }}</p>
              <p-button 
                [label]="'dashboard.review_requests' | translate"
                icon="pi pi-inbox"
                severity="primary"
                (onClick)="navigateToApplications()">
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

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .application-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .application-info {
      flex: 1;
    }

    .student-name {
      display: flex;
      align-items: center;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .application-details {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .application-date {
      color: #666;
      font-size: 0.9rem;
    }

    .students-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .student-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .student-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .student-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .student-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), #1e3a5f);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .student-info {
      flex: 1;
    }

    .student-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .student-email {
      color: #666;
      font-size: 0.9rem;
    }

    .student-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .student-actions {
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

      .application-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .application-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .students-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
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
export class MentorDashboardComponent implements OnInit {
  loading = true;
  companyName = 'Mentor Dashboard'; // Default fallback
  
  // Statistics
  totalStudents = 0;
  activeInternships = 0;
  pendingApplications = 0;
  reportsToReview = 0;

  // Data
  recentApplications: InternshipApplicationInfo[] = [];
  currentStudents: AssignedInternshipInfo[] = [];

  constructor(
    private mentorService: MentorService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    this.loading = true;
    
    try {
      // Load data in parallel
      const [applicationsResponse, internshipsResponse] = await Promise.all([
        this.loadApplications(),
        this.loadInternships()
      ]);

      this.calculateStatistics();
      this.extractCompanyName();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Greška pri učitavanju podataka.');
    } finally {
      this.loading = false;
    }
  }

  private loadApplications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mentorService.getInternshipApplications().subscribe({
        next: (response) => {
          // Convert string enum values to numeric for consistency
          this.recentApplications = response.internshipApplications
            .map(app => ({
              ...app,
              status: parseInternshipStatus(app.status),
              studyLevel: parseStudyLevel(app.studyLevel)
            }))
            .slice(0, 5); // Show only recent 5
          
          this.pendingApplications = response.internshipApplications.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          reject(error);
        }
      });
    });
  }

  private loadInternships(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mentorService.getAssignedInternships().subscribe({
        next: (response) => {
          // Convert string enum values to numeric for consistency
          const internships = response.internships.map(internship => ({
            ...internship,
            status: parseInternshipStatus(internship.status),
            studyLevel: parseStudyLevel(internship.studyLevel)
          }));

          this.currentStudents = internships.slice(0, 6); // Show only first 6
          this.totalStudents = internships.length;
          this.activeInternships = internships.filter(i => 
            i.status === InternshipStatus.Accepted || i.status === InternshipStatus.Completed
          ).length;
          this.reportsToReview = internships.filter(i => 
            i.status === InternshipStatus.Completed
          ).length;
          
          resolve();
        },
        error: (error) => {
          console.error('Error loading internships:', error);
          reject(error);
        }
      });
    });
  }

  private extractCompanyName(): void {
    // Try to get company name from applications first
    if (this.recentApplications.length > 0 && this.recentApplications[0].internshipProvider?.name) {
      this.companyName = this.recentApplications[0].internshipProvider.name;
      return;
    }

    // Try to get company name from internships
    if (this.currentStudents.length > 0 && this.currentStudents[0].internshipProvider?.name) {
      this.companyName = this.currentStudents[0].internshipProvider.name;
      return;
    }

    // Keep default if no company name found
    this.companyName = 'Mentor Dashboard';
  }

  private calculateStatistics(): void {
    // Statistics are calculated in the load methods above
    // This method can be used for additional calculations if needed
  }

  // Navigation methods
  navigateToApplications(): void {
    this.router.navigate(['/mentor/applications']);
  }

  navigateToStudents(): void {
    this.router.navigate(['/mentor/students']);
  }

  navigateToDocuments(): void {
    this.router.navigate(['/mentor/documents']);
  }

  viewApplication(application: InternshipApplicationInfo): void {
    this.navigateToApplications();
  }

  viewStudentDetails(student: AssignedInternshipInfo): void {
    this.navigateToStudents();
  }

  viewReport(student: AssignedInternshipInfo): void {
    this.router.navigate(['/mentor/internships', student.id, 'report']);
  }

  // Helper methods
  getStudentName(item: InternshipApplicationInfo | AssignedInternshipInfo): string {
    if (!item.student) return this.translationService.instant('common.unknown_student');
    
    const student = item.student;
    if (student.fullName) return student.fullName;
    
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    const fullNameFromParts = `${firstName} ${lastName}`.trim();
    
    if (fullNameFromParts) return fullNameFromParts;
    if (student.emailAddress) return student.emailAddress;
    
    return this.translationService.instant('common.unknown_student');
  }

  getStatusText(status: InternshipStatus | string | number): string {
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return this.translationService.instant('status.pending');
        case 'Accepted': return this.translationService.instant('status.accepted');
        case 'Rejected': return this.translationService.instant('status.rejected');
        case 'Completed': return this.translationService.instant('status.completed');
        default: return this.translationService.instant('status.unknown');
      }
    }
    
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
        case 'Undergraduate': return this.translationService.instant('status.undergraduate');
        case 'Graduate': return this.translationService.instant('status.graduate');
        default: return this.translationService.instant('status.unknown');
      }
    }
    
    const numericLevel = Number(level);
    switch (numericLevel) {
      case StudyLevel.Undergraduate: return this.translationService.instant('status.undergraduate');
      case StudyLevel.Graduate: return this.translationService.instant('status.graduate');
      default: return this.translationService.instant('status.unknown');
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

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translationService.instant('common.error'),
      detail: message,
      life: 5000
    });
  }
} 