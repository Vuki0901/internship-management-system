import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { AdministrationService, DashboardStatistics, RecentActivity } from '../services/administration.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ChipModule,
    DividerModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Administrator Dashboard</h1>
        <p>Pregled sustava upravljanja praksama - statistike i upravljanje</p>
      </div>

      <!-- Loading State -->
      @if (isLoading && !statistics) {
        <div class="loading-grid">
          <p-card *ngFor="let item of [1,2,3,4,5,6,7,8]" [style]="{'margin-bottom': '1.5rem'}">
            <p-skeleton height="2rem" [style]="{'margin-bottom': '1rem'}"></p-skeleton>
            <p-skeleton height="4rem" [style]="{'margin-bottom': '1rem'}"></p-skeleton>
            <p-skeleton height="1rem"></p-skeleton>
          </p-card>
        </div>
      } @else if (error && !isLoading) {
        <!-- Error State -->
        <p-card>
          <div class="error-state">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <h3>Greška pri dohvaćanju podataka</h3>
            <p>{{ error }}</p>
            <p-button 
              label="Pokušaj ponovno"
              icon="pi pi-refresh"
              severity="primary"
              (onClick)="loadDashboardData()">
            </p-button>
          </div>
        </p-card>
      } @else if (statistics) {
        
        <!-- User Statistics -->
        <p-card header="Korisnici sustava" [style]="{'margin-bottom': '1.5rem'}">
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalUsers }}</div>
                <div class="stat-label">Ukupno korisnika</div>
                <div class="stat-sublabel">Svi registrirani korisnici</div>
              </div>
            </div>

            <div class="stat-card info">
              <div class="stat-icon">
                <i class="pi pi-graduation-cap"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalStudents }}</div>
                <div class="stat-label">Studenti</div>
                <div class="stat-sublabel">Registrirani studenti</div>
              </div>
            </div>

            <div class="stat-card success">
              <div class="stat-icon">
                <i class="pi pi-user-edit"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalMentors }}</div>
                <div class="stat-label">Mentori</div>
                <div class="stat-sublabel">Aktivni mentori</div>
              </div>
            </div>

            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="pi pi-briefcase"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalSupervisors }}</div>
                <div class="stat-label">Voditelji</div>
                <div class="stat-sublabel">Voditelji praksi</div>
              </div>
            </div>

            <div class="stat-card secondary">
              <div class="stat-icon">
                <i class="pi pi-cog"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalAdministrators }}</div>
                <div class="stat-label">Administratori</div>
                <div class="stat-sublabel">Sistemski administratori</div>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Internship Statistics -->
        <p-card header="Prakse" [style]="{'margin-bottom': '1.5rem'}">
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalInternships }}</div>
                <div class="stat-label">Ukupno praksi</div>
                <div class="stat-sublabel">Sve prijave za prakse</div>
              </div>
            </div>

            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.pendingInternships }}</div>
                <div class="stat-label">Na čekanju</div>
                <div class="stat-sublabel">Čekaju odobrenje</div>
              </div>
            </div>

            <div class="stat-card success">
              <div class="stat-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.acceptedInternships }}</div>
                <div class="stat-label">Prihvaćene</div>
                <div class="stat-sublabel">Odobrene prakse</div>
              </div>
            </div>

            <div class="stat-card info">
              <div class="stat-icon">
                <i class="pi pi-play-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.inProgressInternships }}</div>
                <div class="stat-label">U tijeku</div>
                <div class="stat-sublabel">Aktivne prakse</div>
              </div>
            </div>

            <div class="stat-card help">
              <div class="stat-icon">
                <i class="pi pi-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.completedInternships }}</div>
                <div class="stat-label">Završene</div>
                <div class="stat-sublabel">Uspješno završene</div>
              </div>
            </div>

            <div class="stat-card danger">
              <div class="stat-icon">
                <i class="pi pi-times-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.rejectedInternships }}</div>
                <div class="stat-label">Odbačene</div>
                <div class="stat-sublabel">Neodobrene prakse</div>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Provider and Report Statistics -->
        <div class="two-column-grid">
          <p-card header="Ponuditelji praksi" [style]="{'margin-bottom': '1.5rem'}">
            <div class="stats-grid">
              <div class="stat-card primary">
                <div class="stat-icon">
                  <i class="pi pi-building"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.totalInternshipProviders }}</div>
                  <div class="stat-label">Ukupno ponuditelja</div>
                  <div class="stat-sublabel">Registrirane tvrtke</div>
                </div>
              </div>

              <div class="stat-card success">
                <div class="stat-icon">
                  <i class="pi pi-verified"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.activeInternshipProviders }}</div>
                  <div class="stat-label">Aktivni ponuditelji</div>
                  <div class="stat-sublabel">Trenutno aktivni</div>
                </div>
              </div>
            </div>
          </p-card>

          <p-card header="Izvještaji" [style]="{'margin-bottom': '1.5rem'}">
            <div class="stats-grid">
              <div class="stat-card primary">
                <div class="stat-icon">
                  <i class="pi pi-file"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.totalReports }}</div>
                  <div class="stat-label">Ukupno izvještaja</div>
                  <div class="stat-sublabel">Svi predani izvještaji</div>
                </div>
              </div>

              <div class="stat-card warning">
                <div class="stat-icon">
                  <i class="pi pi-hourglass"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.pendingReports }}</div>
                  <div class="stat-label">Na čekanju</div>
                  <div class="stat-sublabel">Čekaju ocjenu</div>
                </div>
              </div>

              <div class="stat-card success">
                <div class="stat-icon">
                  <i class="pi pi-star"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.gradedReports }}</div>
                  <div class="stat-label">Ocijenjeni</div>
                  <div class="stat-sublabel">Ocijenjeni izvještaji</div>
                </div>
              </div>

              <div class="stat-card info">
                <div class="stat-icon">
                  <i class="pi pi-shield"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.confirmedReports }}</div>
                  <div class="stat-label">Potvrđeni</div>
                  <div class="stat-sublabel">Finalizirani izvještaji</div>
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <p-card header="Brze akcije" [style]="{'margin-bottom': '1.5rem'}">
          <div class="quick-actions">
            <p-button 
              label="Upravljanje korisnicima"
              icon="pi pi-users"
              severity="primary"
              [outlined]="true"
              routerLink="/administration/users"
              [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
            </p-button>
            <p-button 
              label="Ponuditelji praksi"
              icon="pi pi-building"
              severity="secondary"
              [outlined]="true"
              routerLink="/administration/internship-providers"
              [style]="{'margin-right': '1rem', 'margin-bottom': '0.5rem'}">
            </p-button>
            <p-button 
              label="Dokumenti"
              icon="pi pi-file"
              severity="info"
              [outlined]="true"
              routerLink="/administration/documents"
              [style]="{'margin-bottom': '0.5rem'}">
            </p-button>
          </div>
        </p-card>

        <!-- Recent Activity -->
        @if (statistics.recentActivities && statistics.recentActivities.length > 0) {
          <p-card header="Nedavne aktivnosti" [style]="{'margin-bottom': '1.5rem'}">
            <div class="activities-list">
              @for (activity of statistics.recentActivities; track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [ngClass]="getActivityIconClass(activity.type)">
                    <i [class]="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-meta">
                      <span class="activity-user">{{ activity.userName }}</span>
                      <span class="activity-date">{{ formatDate(activity.createdOn) }}</span>
                    </div>
                  </div>
                  <p-chip 
                    [label]="getActivityTypeText(activity.type)"
                    [style]="getActivityTypeStyle(activity.type)">
                  </p-chip>
                </div>
              }
            </div>
          </p-card>
        } @else {
          <p-card header="Nedavne aktivnosti">
            <div class="empty-state">
              <i class="pi pi-history empty-icon"></i>
              <h3>Nema nedavnih aktivnosti</h3>
              <p>Aktivnosti će se prikazati kada se dogode promjene u sustavu.</p>
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .two-column-grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

    .stat-card.secondary .stat-icon {
      background: linear-gradient(135deg, #6c757d, #495057);
    }

    .stat-card.help .stat-icon {
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
    }

    .stat-card.danger .stat-icon {
      background: linear-gradient(135deg, #dc3545, #c82333);
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

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .activity-icon.user {
      background: linear-gradient(135deg, #17a2b8, #6f42c1);
    }

    .activity-icon.internship {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .activity-icon.provider {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
    }

    .activity-icon.report {
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #666;
    }

    .error-state, .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
    }

    .error-icon, .empty-icon {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .error-icon {
      color: #dc3545;
    }

    .error-state h3, .empty-state h3 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .error-state p, .empty-state p {
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

      .two-column-grid {
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

      .activity-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .activity-meta {
        flex-direction: column;
        gap: 0.25rem;
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
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
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
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  statistics: DashboardStatistics | null = null;
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private administrationService: AdministrationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.administrationService.getDashboardStatistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data: DashboardStatistics) => {
          this.statistics = data;
        },
        error: (error: any) => {
          console.error('Error loading dashboard statistics:', error);
          this.error = 'Greška pri dohvaćanju statistika. Molimo pokušajte ponovno.';
          this.showError('Greška pri dohvaćanju podataka');
        }
      });
  }

  getActivityIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'user': return 'pi pi-users';
      case 'internship': return 'pi pi-calendar';
      case 'provider': return 'pi pi-building';
      case 'report': return 'pi pi-file';
      default: return 'pi pi-info-circle';
    }
  }

  getActivityIconClass(type: string): string {
    return type.toLowerCase();
  }

  getActivityTypeText(type: string): string {
    switch (type.toLowerCase()) {
      case 'user': return 'Korisnik';
      case 'internship': return 'Praksa';
      case 'provider': return 'Ponuditelj';
      case 'report': return 'Izvještaj';
      default: return 'Aktivnost';
    }
  }

  getActivityTypeStyle(type: string): any {
    switch (type.toLowerCase()) {
      case 'user': return { 'background-color': '#17a2b8', 'color': 'white' };
      case 'internship': return { 'background-color': '#28a745', 'color': 'white' };
      case 'provider': return { 'background-color': '#ffc107', 'color': '#212529' };
      case 'report': return { 'background-color': '#6f42c1', 'color': 'white' };
      default: return { 'background-color': '#6c757d', 'color': 'white' };
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Prije manje od sat vremena';
    } else if (diffInHours < 24) {
      return `Prije ${diffInHours} ${diffInHours === 1 ? 'sat' : diffInHours < 5 ? 'sata' : 'sati'}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Jučer';
      } else if (diffInDays < 7) {
        return `Prije ${diffInDays} ${diffInDays < 5 ? 'dana' : 'dana'}`;
      } else {
        return date.toLocaleDateString('hr-HR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
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