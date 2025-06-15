import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { 
  InternshipSupervisorService, 
  InternshipInformation, 
  InternshipStatus, 
  StudyLevel,
  InternshipProviderInfo
} from '../services/internship-supervisor.service';

@Component({
  selector: 'app-supervisor-internships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputTextModule,
    ChipModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Sve prakse</h1>
        <p>Pregled svih praksi u sustavu</p>
      </header>

      <div class="content-wrapper">
        <!-- Filters -->
        <p-card class="filters-card">
          <div class="filters-grid">
            <div class="filter-group">
              <label for="search">Pretraživanje</label>
              <input 
                pInputText 
                id="search"
                [(ngModel)]="searchTerm" 
                placeholder="Pretraži po nazivu ili adresi ponuditelja..."
                (input)="onSearchChange()"
                class="search-input">
            </div>
            
            <div class="filter-group">
              <label for="status">Status</label>
              <p-dropdown 
                id="status"
                [options]="statusOptions" 
                [(ngModel)]="selectedStatus"
                optionLabel="label" 
                optionValue="value"
                placeholder="Svi statusi"
                [showClear]="true"
                (onChange)="onFilterChange()"
                class="filter-dropdown">
              </p-dropdown>
            </div>
            
            <div class="filter-group">
              <label for="provider">Ponuditelj</label>
              <p-dropdown 
                id="provider"
                [options]="providerOptions" 
                [(ngModel)]="selectedProviderId"
                optionLabel="label" 
                optionValue="value"
                placeholder="Svi ponuditelji"
                [showClear]="true"
                (onChange)="onFilterChange()"
                class="filter-dropdown">
              </p-dropdown>
            </div>
          </div>
        </p-card>

        <!-- Results -->
        <p-card class="results-card">
          <div class="results-header">
            <h3>Rezultati ({{ totalCount }})</h3>
          </div>

          @if (loading) {
            <div class="loading-container">
              <p-progressSpinner></p-progressSpinner>
              <p>Učitavanje praksi...</p>
            </div>
          } @else if (internships.length === 0) {
            <div class="no-results">
              <i class="fa-solid fa-search"></i>
              <h3>Nema rezultata</h3>
              <p>Nema praksi koje odgovaraju vašim kriterijima pretrage.</p>
            </div>
          } @else {
            <p-table [value]="internships" [responsive]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>Student</th>
                  <th>Ponuditelj</th>
                  <th>Razina studija</th>
                  <th>Status</th>
                  <th>Datum početka</th>
                  <th>Datum završetka</th>
                  <th>Mentor</th>
                  <th>Akcije</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-internship>
                <tr>
                  <td>
                    @if (internship.student) {
                      <div class="student-info">
                        <strong>{{ internship.student.fullName || (internship.student.firstName + ' ' + internship.student.lastName) }}</strong>
                        <small>{{ internship.student.emailAddress }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    @if (internship.internshipProvider) {
                      <div class="provider-info">
                        <strong>{{ internship.internshipProvider.name }}</strong>
                        <small>{{ internship.internshipProvider.address }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    <p-chip 
                      [label]="getStudyLevelText(internship.studyLevel)"
                      [style]="getStudyLevelStyle(internship.studyLevel)">
                    </p-chip>
                  </td>
                  <td>
                    <p-chip 
                      [label]="getStatusText(internship.status)"
                      [style]="getStatusStyle(internship.status)">
                    </p-chip>
                  </td>
                  <td>{{ formatDate(internship.startDate) }}</td>
                  <td>{{ formatDate(internship.endDate) }}</td>
                  <td>
                    @if (internship.mentor) {
                      <div class="mentor-info">
                        <strong>{{ internship.mentor.fullName || (internship.mentor.firstName + ' ' + internship.mentor.lastName) }}</strong>
                        <small>{{ internship.mentor.emailAddress }}</small>
                      </div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    @if (internship.status === InternshipStatus.Completed) {
                      <p-button 
                        label="Izvještaj" 
                        icon="pi pi-file-text" 
                        size="small"
                        severity="info"
                        (onClick)="viewReport(internship.id)"
                        [style]="{'font-size': '0.8rem'}">
                      </p-button>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <!-- Pagination -->
            <p-paginator 
              [rows]="pageSize"
              [totalRecords]="totalCount"
              [first]="(currentPage - 1) * pageSize"
              (onPageChange)="onPageChange($event)"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Prikazuje {first} do {last} od {totalRecords} rezultata">
            </p-paginator>
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
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1.5rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .search-input {
      width: 100%;
    }

    .filter-dropdown {
      width: 100%;
    }

    .results-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .results-header {
      margin-bottom: 1.5rem;
    }

    .results-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-results i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .no-results h3 {
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

    .text-muted {
      color: #999;
      font-style: italic;
    }

    :host ::ng-deep .p-paginator {
      margin-top: 1.5rem;
      border: none;
      background: transparent;
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

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .page-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class SupervisorInternshipsComponent implements OnInit {
  internships: InternshipInformation[] = [];
  providers: InternshipProviderInfo[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  
  // Filters
  searchTerm = '';
  selectedStatus: InternshipStatus | null = null;
  selectedProviderId: string | null = null;
  
  // Dropdown options
  statusOptions = [
    { label: 'Na čekanju', value: InternshipStatus.Pending },
    { label: 'Prihvaćeno', value: InternshipStatus.Accepted },
    { label: 'Odbačeno', value: InternshipStatus.Rejected },
    { label: 'Završeno', value: InternshipStatus.Completed }
  ];
  
  providerOptions: { label: string; value: string }[] = [];
  
  // Expose enum to template
  InternshipStatus = InternshipStatus;
  
  private searchTimeout: any;

  constructor(
    private supervisorService: InternshipSupervisorService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.loadInternships();
  }

  loadProviders(): void {
    this.supervisorService.getInternshipProviders().subscribe({
      next: (response) => {
        this.providers = response.internshipProviders;
        this.providerOptions = this.providers.map(p => ({
          label: p.name,
          value: p.id
        }));
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.showError('Greška pri učitavanju ponuditelja prakse.');
      }
    });
  }

  loadInternships(): void {
    this.loading = true;
    
    this.supervisorService.getInternships(
      this.currentPage,
      this.pageSize,
      this.selectedStatus || undefined,
      this.selectedProviderId || undefined,
      this.searchTerm || undefined
    ).subscribe({
      next: (response) => {
        this.internships = response.internships;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading internships:', error);
        this.loading = false;
        this.showError('Greška pri učitavanju praksi.');
      }
    });
  }

  onSearchChange(): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadInternships();
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadInternships();
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadInternships();
  }

  viewReport(internshipId: string): void {
    this.router.navigate(['/supervisor/internships', internshipId, 'report']);
  }

  getStatusText(status: InternshipStatus | string | number): string {
    // Handle string values from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return 'Na čekanju';
        case 'Accepted': return 'Prihvaćeno';
        case 'Rejected': return 'Odbačeno';
        case 'Completed': return 'Završeno';
        default: return 'Nepoznato';
      }
    }
    
    // Handle numeric enum values
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
    // Handle string values from backend
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return { 'background-color': '#ffc107', 'color': '#000' };
        case 'Accepted': return { 'background-color': '#28a745', 'color': '#fff' };
        case 'Rejected': return { 'background-color': '#dc3545', 'color': '#fff' };
        case 'Completed': return { 'background-color': '#17a2b8', 'color': '#fff' };
        default: return { 'background-color': '#6c757d', 'color': '#fff' };
      }
    }
    
    // Handle numeric enum values
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
      summary: 'Greška',
      detail: message,
      life: 5000
    });
  }
} 