import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { 
  MentorService, 
  InternshipApplicationInfo, 
  ApplicationDecision, 
  InternshipStatus,
  StudyLevel,
  parseInternshipStatus,
  parseStudyLevel
} from '../services/mentor.service';

@Component({
  selector: 'app-internship-applications',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Zahtjevi za praksu</h2>
        <p class="text-600">Upravljajte zahtjevima studenata za praksu u vašoj tvrtki</p>
      </div>

      <p-table 
        [value]="applications" 
        [loading]="loading"
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Prikazuje {first} do {last} od {totalRecords} zahtjeva"
        [rowsPerPageOptions]="[10, 25, 50]"
        responsiveLayout="scroll">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Razina studija</th>
            <th>Datum početka</th>
            <th>Datum prijave</th>
            <th>Status</th>
            <th>Akcije</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-application>
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user text-primary"></i>
                <span class="font-medium">
                  {{ application.student?.fullName || 'Nepoznato' }}
                </span>
              </div>
            </td>
            <td>
              <span class="text-600">{{ application.student?.emailAddress || '-' }}</span>
            </td>
            <td>
              <p-tag 
                [value]="getStudyLevelLabel(application.studyLevel)" 
                [severity]="getStudyLevelSeverity(application.studyLevel)">
              </p-tag>
            </td>
            <td>
              <span class="text-700">
                {{ application.startDate ? (application.startDate | date:'dd.MM.yyyy') : '-' }}
              </span>
            </td>
            <td>
              <span class="text-600">
                {{ application.createdOn | date:'dd.MM.yyyy HH:mm' }}
              </span>
            </td>
            <td>
              <p-tag 
                [value]="getStatusLabel(application.status)" 
                [severity]="getStatusSeverity(application.status)">
              </p-tag>
            </td>
            <td>
              <div class="flex gap-2" *ngIf="application.status === InternshipStatus.Pending">
                <p-button 
                  icon="pi pi-check" 
                  severity="success" 
                  size="small"
                  [text]="true"
                  pTooltip="Prihvati zahtjev"
                  (onClick)="confirmAccept(application)">
                </p-button>
                <p-button 
                  icon="pi pi-times" 
                  severity="danger" 
                  size="small"
                  [text]="true"
                  pTooltip="Odbaci zahtjev"
                  (onClick)="confirmReject(application)">
                </p-button>
              </div>
              <span *ngIf="application.status !== InternshipStatus.Pending" class="text-500">
                Obrađeno
              </span>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <div class="text-500">
                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                <p class="text-lg">Nema novih zahtjeva za praksu</p>
                <p class="text-600">Kada studenti pošalju zahtjeve, prikazat će se ovdje.</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
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
  `]
})
export class InternshipApplicationsComponent implements OnInit {
  applications: InternshipApplicationInfo[] = [];
  loading = false;
  
  // Expose enum to template
  InternshipStatus = InternshipStatus;

  constructor(
    private mentorService: MentorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.mentorService.getInternshipApplications().subscribe({
      next: (response) => {
        // Convert string enum values from API to numeric values for frontend
        this.applications = response.internshipApplications.map(app => ({
          ...app,
          status: parseInternshipStatus(app.status),
          studyLevel: parseStudyLevel(app.studyLevel)
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Greška pri dohvaćanju zahtjeva za praksu'
        });
        this.loading = false;
      }
    });
  }

  confirmAccept(application: InternshipApplicationInfo) {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite prihvatiti zahtjev studenta ${application.student?.fullName}?`,
      header: 'Potvrda prihvaćanja',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Da, prihvati',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.acceptApplication(application);
      }
    });
  }

  confirmReject(application: InternshipApplicationInfo) {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite odbaciti zahtjev studenta ${application.student?.fullName}?`,
      header: 'Potvrda odbacivanja',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Da, odbaci',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rejectApplication(application);
      }
    });
  }

  acceptApplication(application: InternshipApplicationInfo) {
    this.mentorService.manageInternshipApplication({
      internshipId: application.id,
      decision: ApplicationDecision.Accept
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: `Zahtjev studenta ${application.student?.fullName} je prihvaćen`
        });
        this.loadApplications(); // Refresh the list
      },
      error: (error) => {
        console.error('Error accepting application:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Greška pri prihvaćanju zahtjeva'
        });
      }
    });
  }

  rejectApplication(application: InternshipApplicationInfo) {
    this.mentorService.manageInternshipApplication({
      internshipId: application.id,
      decision: ApplicationDecision.Reject
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: `Zahtjev studenta ${application.student?.fullName} je odbačen`
        });
        this.loadApplications(); // Refresh the list
      },
      error: (error) => {
        console.error('Error rejecting application:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Greška pri odbacivanju zahtjeva'
        });
      }
    });
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
} 