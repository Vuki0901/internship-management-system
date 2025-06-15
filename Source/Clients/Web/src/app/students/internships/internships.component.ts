import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InternshipProvidersService, InternshipProvider } from '../services/internship-providers.service';
import { InternshipsService, InternshipInformation, InternshipStatus, StudyLevel } from '../services/internships.service';
import { ApplyInternshipDialogComponent } from '../components/apply-internship-dialog/apply-internship-dialog.component';

interface ProviderDisplay extends InternshipProvider {
  // Using the actual data model from backend
}

interface InternshipDisplay extends InternshipInformation {
  statusLabel: string;
  statusSeverity: 'success' | 'warning' | 'danger' | 'info';
  studyLevelLabel: string;
  createdOn: string;
}

@Component({
  selector: 'app-student-internships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule, 
    ButtonModule, 
    SelectModule, 
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToastModule,
    TagModule,
    ConfirmDialogModule,
    ApplyInternshipDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Upravljanje praksama</h1>
        <p>Pregled vaših prijava za praksu i mogućnost prijave kod novih pružatelja prakse</p>
      </header>

      <!-- My Internship Applications Section -->
      <div class="content-card" style="margin-bottom: 2rem;">
        <div class="section-header">
          <h2>Moje prijave za praksu</h2>
          <p-button 
            label="Osvježi" 
            icon="pi pi-refresh" 
            [text]="true"
            (onClick)="loadMyInternships()">
          </p-button>
        </div>

        <p-table 
          [value]="myInternships" 
          [loading]="loadingInternships"
          [paginator]="false"
          [tableStyle]="{'min-width': '50rem'}">

          <ng-template pTemplate="header">
            <tr>
              <th>Pružatelj prakse</th>
              <th>Razina studija</th>
              <th>Željeni početak</th>
              <th>Status</th>
              <th>Datum prijave</th>
              <th>Akcije</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-internship>
            <tr>
              <td>{{ internship.internshipProvider?.name || '-' }}</td>
              <td>{{ internship.studyLevelLabel }}</td>
              <td>{{ internship.startDate ? formatDate(internship.startDate) : '-' }}</td>
              <td>
                <p-tag 
                  [value]="internship.statusLabel" 
                  [severity]="internship.statusSeverity">
                </p-tag>
              </td>
              <td>{{ formatDate(internship.createdOn) }}</td>
              <td>
                <div class="action-buttons">
                  <!-- Complete Internship Button - for Accepted status -->
                  @if (isAcceptedStatus(internship.status)) {
                    <p-button 
                      label="Završi praksu" 
                      icon="pi pi-check-circle" 
                      size="small"
                      severity="success"
                      (onClick)="completeInternship(internship)"
                      [style]="{'font-size': '0.8rem', 'margin-right': '0.5rem'}">
                    </p-button>
                  }
                  
                  <!-- Report Button - for Completed status -->
                  @if (isCompletedStatus(internship.status)) {
                    <p-button 
                      label="Izvještaj" 
                      icon="pi pi-file-export" 
                      size="small"
                      severity="info"
                      (onClick)="viewReport(internship.id)"
                      [style]="{'font-size': '0.8rem'}">
                    </p-button>
                  }
                  
                  <!-- No action for other statuses -->
                  @if (!isAcceptedStatus(internship.status) && !isCompletedStatus(internship.status)) {
                    <span class="no-action">-</span>
                  }
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                Još niste se prijavili za nijednu praksu.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      
      <!-- Available Internship Providers Section -->
      <div class="content-card">
        <div class="section-header">
          <h2>Dostupni pružatelji prakse</h2>
          <p>Odaberite pružatelja prakse kod kojeg se želite prijaviti</p>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <p-iconfield iconPosition="left">
            <p-inputicon>
              <i class="pi pi-search"></i>
            </p-inputicon>
            <input 
              type="text" 
              pInputText 
              placeholder="Pretraži pružatelje prakse..."
              [(ngModel)]="searchTerm"
              (input)="filterProviders()">
          </p-iconfield>
        </div>

        <!-- Table Section -->
        <p-table 
          [value]="filteredProviders" 
          [loading]="loading"
          [paginator]="true" 
          [rows]="10"
          [totalRecords]="filteredProviders.length"
          [rowsPerPageOptions]="[10, 25, 50]"
          [sortMode]="'multiple'"
          [tableStyle]="{'min-width': '70rem'}"
          [showFirstLastIcon]="false"
          currentPageReportTemplate="Prikazuje se {first} do {last} od {totalRecords} unosa"
          [showCurrentPageReport]="true">

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name" style="min-width: 15rem">
                Naziv
                <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="address" style="min-width: 18rem">
                Adresa
                <p-sortIcon field="address"></p-sortIcon>
              </th>
              <th pSortableColumn="contactEmailAddress" style="min-width: 16rem">
                Email
                <p-sortIcon field="contactEmailAddress"></p-sortIcon>
              </th>
              <th pSortableColumn="contactPhoneNumber" style="min-width: 10rem">
                Telefon
                <p-sortIcon field="contactPhoneNumber"></p-sortIcon>
              </th>
              <th style="width: 10rem">Akcije</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-provider>
            <tr>
              <td>
                <span class="provider-name">
                  {{ provider.name }}
                </span>
              </td>
              <td>
                <span class="provider-address">
                  {{ provider.address }}
                </span>
              </td>
              <td>
                <a [href]="'mailto:' + provider.contactEmailAddress" class="provider-email">
                  {{ provider.contactEmailAddress }}
                </a>
              </td>
              <td>
                <a [href]="'tel:' + provider.contactPhoneNumber" class="provider-phone">
                  {{ provider.contactPhoneNumber }}
                </a>
              </td>
              <td>
                <p-button 
                  label="Prijavi se" 
                  icon="pi pi-user-plus" 
                  size="small"
                  (onClick)="applyForInternship(provider)"
                  [style]="{'font-size': '0.8rem'}">
                </p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">
                Nema dostupnih pružatelja prakse.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Apply for Internship Dialog -->
    <app-apply-internship-dialog
      [(visible)]="showApplyDialog"
      [selectedProvider]="selectedProviderForApplication"
      (applicationSubmitted)="onApplicationSubmitted()">
    </app-apply-internship-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .page-container {
      padding: 2rem 3rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }

    .page-header p {
      margin: 0.5rem 0 0 0;
      color: #666;
      font-size: 1.1rem;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .section-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .section-header p {
      margin: 0.25rem 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .search-section {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .filter-label {
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 1rem;
      display: block;
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Table Styling */
    ::ng-deep .p-datatable {
      border: none;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: #f8f9fa;
      border: none;
      border-bottom: 2px solid #e9ecef;
      color: var(--primary-color);
      font-weight: 600;
      padding: 1rem;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 1rem;
      border: none;
      border-bottom: 1px solid #f1f3f4;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: #f8f9fa;
    }

    .table-row-selected {
      background: rgba(21, 50, 76, 0.05) !important;
    }

    .provider-name {
      font-weight: 600;
      color: var(--primary-color);
    }

    .provider-address {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .provider-email, .provider-phone {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .provider-email:hover, .provider-phone:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    /* Pagination Styling */
    ::ng-deep .p-paginator {
      border: none;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      padding: 1rem 2rem;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page {
      color: var(--primary-color);
      border: 1px solid #e9ecef;
      background: white;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    ::ng-deep .p-paginator .p-paginator-current {
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* Select Styling */
    ::ng-deep .p-select {
      border: 1px solid #e9ecef;
      border-radius: 6px;
    }

    ::ng-deep .p-select:not(.p-disabled).p-focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    /* Checkbox Styling */
    ::ng-deep .p-checkbox .p-checkbox-box.p-highlight {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    /* Button Styling */
    ::ng-deep .p-button.p-button-text {
      color: var(--primary-color);
    }

    ::ng-deep .p-button.p-button-text:hover {
      background: rgba(21, 50, 76, 0.1);
    }

    .no-action {
      color: #6c757d;
      font-style: italic;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .filters-row {
        flex-direction: column;
      }

      .filters-row > * {
        min-width: 100% !important;
      }
    }
  `]
})
export class StudentInternshipsComponent implements OnInit {
  displayProviders: ProviderDisplay[] = [];
  filteredProviders: ProviderDisplay[] = [];
  myInternships: InternshipDisplay[] = [];
  loading = false;
  loadingInternships = false;
  searchTerm = '';
  
  // Apply dialog state
  showApplyDialog = false;
  selectedProviderForApplication: InternshipProvider | null = null;

  constructor(
    private internshipProvidersService: InternshipProvidersService,
    private internshipsService: InternshipsService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadInternshipProviders();
    this.loadMyInternships();
  }

  loadInternshipProviders(): void {
    this.loading = true;
    this.internshipProvidersService.getInternshipProviders().subscribe({
      next: (result) => {
        this.displayProviders = result.internshipProviders;
        this.filteredProviders = [...this.displayProviders];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading internship providers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Nije moguće učitati pružatelje prakse.'
        });
        this.loading = false;
      }
    });
  }

  loadMyInternships(): void {
    this.loadingInternships = true;
    this.internshipsService.getInternships().subscribe({
      next: (result) => {
        this.myInternships = result.internships.map(internship => ({
          ...internship,
          statusLabel: this.getStatusLabel(internship.status),
          statusSeverity: this.getStatusSeverity(internship.status),
          studyLevelLabel: this.getStudyLevelLabel(internship.studyLevel)
        }));
        this.loadingInternships = false;
      },
      error: (error) => {
        console.error('Error loading my internships:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška', 
          detail: 'Nije moguće učitati vaše prijave za praksu.'
        });
        this.loadingInternships = false;
      }
    });
  }

  filterProviders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProviders = [...this.displayProviders];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredProviders = this.displayProviders.filter(provider =>
        provider.name?.toLowerCase().includes(searchLower) ||
        provider.address?.toLowerCase().includes(searchLower) ||
        provider.contactEmailAddress?.toLowerCase().includes(searchLower)
      );
    }
  }

  applyForInternship(provider: InternshipProvider): void {
    this.selectedProviderForApplication = provider;
    this.showApplyDialog = true;
  }

  onApplicationSubmitted(): void {
    // Refresh the internships list
    this.loadMyInternships();
  }

  viewReport(internshipId: string): void {
    this.router.navigate(['/student/internships', internshipId, 'report']);
  }

  completeInternship(internship: InternshipDisplay): void {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite označiti praksu kod "${internship.internshipProvider?.name}" kao završenu? Ova akcija se ne može poništiti.`,
      header: 'Potvrda završetka prakse',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markInternshipAsCompleted(internship.id);
      }
    });
  }

  private markInternshipAsCompleted(internshipId: string): void {
    this.internshipsService.markInternshipCompleted(internshipId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: 'Praksa je uspješno označena kao završena. Sada možete generirati izvještaj.'
        });
        this.loadMyInternships(); // Refresh the list
      },
      error: (error) => {
        console.error('Error completing internship:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Dogodila se greška pri označavanju prakse kao završene. Molimo pokušajte ponovno.'
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR');
  }

  private getStatusLabel(status: InternshipStatus | string): string {
    const statusStr = typeof status === 'string' ? status : status.toString();
    switch (statusStr) {
      case 'Pending':
      case '1':
        return 'Na čekanju';
      case 'Accepted':
      case '2':
        return 'Prihvaćeno';
      case 'Rejected':
      case '3':
        return 'Odbačeno';
      case 'Completed':
      case '4':
        return 'Završeno';
      default:
        return 'Nepoznato';
    }
  }

  private getStatusSeverity(status: InternshipStatus | string): 'success' | 'warning' | 'danger' | 'info' {
    const statusStr = typeof status === 'string' ? status : status.toString();
    switch (statusStr) {
      case 'Pending':
      case '1':
        return 'warning';
      case 'Accepted':
      case '2':
        return 'success';
      case 'Rejected':
      case '3':
        return 'danger';
      case 'Completed':
      case '4':
        return 'info';
      default:
        return 'info';
    }
  }

  private getStudyLevelLabel(studyLevel: StudyLevel | string): string {
    const studyLevelStr = typeof studyLevel === 'string' ? studyLevel : studyLevel.toString();
    switch (studyLevelStr) {
      case 'Undergraduate':
      case '1':
        return 'Preddiplomski';
      case 'Graduate':
      case '2':
        return 'Diplomski';
      default:
        return 'Nepoznato';
    }
  }

  isAcceptedStatus(status: InternshipStatus | string): boolean {
    const statusStr = typeof status === 'string' ? status : status.toString();
    return statusStr === 'Accepted' || statusStr === '2';
  }

  isCompletedStatus(status: InternshipStatus | string): boolean {
    const statusStr = typeof status === 'string' ? status : status.toString();
    return statusStr === 'Completed' || statusStr === '4';
  }
} 