import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { 
  MentorService, 
  AssignedInternshipInfo, 
  InternshipStatus,
  StudyLevel,
  parseInternshipStatus,
  parseStudyLevel
} from '../services/mentor.service';

interface StatusFilter {
  label: string;
  value: InternshipStatus | null;
}

@Component({
  selector: 'app-mentor-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    CardModule,
    DropdownModule
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Moji studenti</h2>
        <p class="text-600">Pregled studenata koji izvršavaju praksu pod vašim vodstvom</p>
      </div>

      <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
        <div class="flex flex-column sm:flex-row sm:align-items-center gap-2 sm:gap-3">
          <label for="statusFilter" class="font-medium text-900 white-space-nowrap">Filtriraj po statusu:</label>
          <p-dropdown 
            id="statusFilter"
            [options]="statusFilterOptions" 
            [(ngModel)]="selectedStatusFilter"
            optionLabel="label"
            optionValue="value"
            placeholder="Svi statusi"
            [showClear]="true"
            (onChange)="onStatusFilterChange()"
            class="w-full sm:w-12rem">
          </p-dropdown>
        </div>
        
        <div class="flex align-items-center text-600 white-space-nowrap">
          <i class="pi pi-users mr-2"></i>
          <span>{{ filteredInternships.length }} {{ filteredInternships.length === 1 ? 'student' : 'studenata' }}</span>
        </div>
      </div>

      <p-table 
        [value]="filteredInternships" 
        [loading]="loading"
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Prikazuje {first} do {last} od {totalRecords} studenata"
        [rowsPerPageOptions]="[10, 25, 50]"
        responsiveLayout="scroll">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Razina studija</th>
            <th>Datum početka</th>
            <th>Datum završetka</th>
            <th>Status</th>
            <th>Datum prijave</th>
            <th>Akcije</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-internship>
          <tr>
                         <td>
               <div class="flex align-items-center gap-2">
                 <i class="pi pi-user" [class]="internship.student ? 'text-primary' : 'text-400'"></i>
                 <div class="flex flex-column">
                   <span class="font-medium" [class]="internship.student ? 'text-900' : 'text-500'">
                     {{ internship.student?.fullName || 'Student nije pronađen' }}
                   </span>
                   <small class="text-500" *ngIf="!internship.student && internship.studentId">
                     ID: {{ internship.studentId }}
                   </small>
                 </div>
               </div>
             </td>
             <td>
               <span [class]="internship.student?.emailAddress ? 'text-600' : 'text-400'">
                 {{ internship.student?.emailAddress || '-' }}
               </span>
             </td>
            <td>
              <p-tag 
                [value]="getStudyLevelLabel(internship.studyLevel)" 
                [severity]="getStudyLevelSeverity(internship.studyLevel)">
              </p-tag>
            </td>
            <td>
              <span class="text-700">
                {{ internship.startDate ? (internship.startDate | date:'dd.MM.yyyy') : '-' }}
              </span>
            </td>
            <td>
              <span class="text-700">
                {{ internship.endDate ? (internship.endDate | date:'dd.MM.yyyy') : '-' }}
              </span>
            </td>
            <td>
              <p-tag 
                [value]="getStatusLabel(internship.status)" 
                [severity]="getStatusSeverity(internship.status)">
              </p-tag>
            </td>
                         <td>
               <span class="text-600">
                 {{ getFormattedDate(internship.createdOn) }}
               </span>
             </td>
            <td>
              <div class="flex gap-2">
                <p-button 
                  icon="pi pi-eye" 
                  severity="info" 
                  size="small"
                  [text]="true"
                  pTooltip="Prikaži detalje"
                  (onClick)="viewDetails(internship)">
                </p-button>
                <p-button 
                  icon="pi pi-file-text" 
                  severity="secondary" 
                  size="small"
                  [text]="true"
                  pTooltip="Dnevnik prakse"
                  (onClick)="viewLogs(internship)">
                </p-button>
                <p-button 
                  *ngIf="internship.status === 4"
                  icon="pi pi-file-export" 
                  severity="warn" 
                  size="small"
                  [text]="true"
                  pTooltip="Izvještaj o praksi"
                  (onClick)="viewReport(internship)">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="8" class="text-center p-4">
              <div class="text-500">
                <i class="pi pi-users text-4xl mb-3 block"></i>
                <p class="text-lg">Nema dodijeljenih studenata</p>
                <p class="text-600">Kada prihvatite zahtjeve za praksu, studenti će se prikazati ovdje.</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-toast></p-toast>
  `,
  styles: [`
    .card-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      margin-bottom: 1rem;
    }

    .card-header h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
      font-size: 1.5rem;
      font-weight: 600;
    }

    :host ::ng-deep .p-tag {
      font-weight: 500;
    }

    :host ::ng-deep .p-button.p-button-text {
      width: 2rem;
      height: 2rem;
    }

    .text-4xl {
      font-size: 2.25rem;
    }

    :host ::ng-deep .p-dropdown {
      border: 1px solid var(--surface-border);
    }

    .white-space-nowrap {
      white-space: nowrap;
    }

    /* Better responsive design */
    @media (max-width: 768px) {
      .card-header {
        padding: 1rem;
      }
      
      .card-header h2 {
        font-size: 1.25rem;
      }
    }

    /* Improve table cell spacing */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.875rem 1rem;
      vertical-align: middle;
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      padding: 1rem;
      font-weight: 600;
      background-color: var(--surface-50);
    }
  `]
})
export class MentorStudentsComponent implements OnInit {
  internships: AssignedInternshipInfo[] = [];
  filteredInternships: AssignedInternshipInfo[] = [];
  loading = false;
  
  selectedStatusFilter: InternshipStatus | null = null;
  
  statusFilterOptions: StatusFilter[] = [
    { label: 'Svi statusi', value: null },
    { label: 'Na čekanju', value: InternshipStatus.Pending },
    { label: 'Prihvaćeno', value: InternshipStatus.Accepted },
    { label: 'Odbačeno', value: InternshipStatus.Rejected },
    { label: 'Završeno', value: InternshipStatus.Completed }
  ];

  constructor(
    private mentorService: MentorService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.mentorService.getAssignedInternships().subscribe({
      next: (response) => {
        // Convert string enum values from API to numeric values for frontend
        this.internships = response.internships.map(internship => ({
          ...internship,
          status: parseInternshipStatus(internship.status),
          studyLevel: parseStudyLevel(internship.studyLevel)
        }));
        
        this.applyStatusFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading internships:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Greška pri dohvaćanju studenata'
        });
        this.loading = false;
      }
    });
  }

  onStatusFilterChange() {
    this.applyStatusFilter();
  }

  applyStatusFilter() {
    if (this.selectedStatusFilter === null) {
      this.filteredInternships = [...this.internships];
    } else {
      this.filteredInternships = this.internships.filter(
        internship => internship.status === this.selectedStatusFilter
      );
    }
  }

  viewDetails(internship: AssignedInternshipInfo) {
    this.messageService.add({
      severity: 'info',
      summary: 'Detalji',
      detail: `Prikazivanje detalja za ${internship.student?.fullName}`
    });
    // TODO: Navigate to internship details page
  }

  viewLogs(internship: AssignedInternshipInfo) {
    this.messageService.add({
      severity: 'info',
      summary: 'Dnevnik prakse',
      detail: `Prikazivanje dnevnika za ${internship.student?.fullName}`
    });
    // TODO: Navigate to internship logs page
  }

  viewReport(internship: AssignedInternshipInfo) {
    this.router.navigate(['/mentor/internships', internship.id, 'report']);
  }

  getStatusLabel(status: InternshipStatus): string {
    const statusMap = {
      [InternshipStatus.Pending]: 'Na čekanju',
      [InternshipStatus.Accepted]: 'Prihvaćeno',
      [InternshipStatus.Rejected]: 'Odbačeno',
      [InternshipStatus.Completed]: 'Završeno'
    };
    return statusMap[status] || 'Nepoznato';
  }

  getStatusSeverity(status: InternshipStatus): 'success' | 'info' | 'warn' | 'danger' {
    const severityMap = {
      [InternshipStatus.Pending]: 'warn' as const,
      [InternshipStatus.Accepted]: 'success' as const,
      [InternshipStatus.Rejected]: 'danger' as const,
      [InternshipStatus.Completed]: 'info' as const
    };
    return severityMap[status] || 'info';
  }

  getStudyLevelLabel(studyLevel: StudyLevel): string {
    const studyLevelMap = {
      [StudyLevel.Undergraduate]: 'Preddiplomski',
      [StudyLevel.Graduate]: 'Diplomski'
    };
    return studyLevelMap[studyLevel] || 'Nepoznato';
  }

  getStudyLevelSeverity(studyLevel: StudyLevel): 'success' | 'info' | 'warn' | 'danger' {
    const severityMap = {
      [StudyLevel.Undergraduate]: 'info' as const,
      [StudyLevel.Graduate]: 'success' as const
    };
    return severityMap[studyLevel] || 'info';
  }

  getFormattedDate(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00+00:00') {
      return 'Nepoznato';
    }
    
    try {
      const date = new Date(dateString);
      if (date.getFullYear() < 1900) {
        return 'Nepoznato';
      }
      return date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Nepoznato';
    }
  }
} 