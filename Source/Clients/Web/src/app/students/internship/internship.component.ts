import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { InternshipLogService, InternshipLogEntry, WorkLocation, InternshipLogStatus, CreateInternshipLogRequest, UpdateInternshipLogRequest } from '../services/internship-log.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-student-internship',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>{{ 'student.internship.title' | translate }}</h1>
      </header>

      <div class="content-card">
        <div class="diary-section">
          <div class="section-header">
            <h2>{{ 'student.internship.diary' | translate }}</h2>
            <div class="header-controls">
              <div class="search-container">
                <i class="pi pi-search search-icon"></i>
                                 <input 
                   type="text" 
                   [placeholder]="'student.internship.search_placeholder' | translate"
                   class="search-input"
                   [(ngModel)]="searchText"
                   (ngModelChange)="filterLogEntries()">
              </div>
              <p-button 
                [label]="'student.internship.add_day' | translate"
                icon="pi pi-plus"
                [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}"
                (onClick)="openLogDialog()">
              </p-button>
            </div>
          </div>

          <p-table 
            [value]="filteredLogEntries" 
            [loading]="loading"
            [tableStyle]="{'min-width': '70rem'}">

            <ng-template pTemplate="header">
              <tr>
                <th style="width: 3rem">
                  <p-checkbox 
                    [(ngModel)]="selectAll" 
                    (onChange)="onSelectAllChange($event)"
                    [binary]="true">
                  </p-checkbox>
                </th>
                <th style="min-width: 10rem">{{ 'student.internship.date' | translate }}</th>
                <th style="min-width: 8rem">{{ 'student.internship.working_hours' | translate }}</th>
                <th style="min-width: 10rem">{{ 'student.internship.location' | translate }}</th>
                <th style="min-width: 8rem">{{ 'student.internship.status' | translate }}</th>
                <th style="width: 12rem">{{ 'student.internship.actions' | translate }}</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-logEntry>
              <tr>
                <td>
                  <p-checkbox 
                    [(ngModel)]="selectedLogs" 
                    [value]="logEntry.id"
                    [binary]="false">
                  </p-checkbox>
                </td>
                <td>
                  <div class="date-cell">
                    <i class="pi pi-calendar date-icon"></i>
                    <span>{{ formatDate(logEntry.date) }}</span>
                  </div>
                </td>
                <td>
                  <div class="hours-cell">
                    <i class="pi pi-clock hours-icon"></i>
                    <span>{{ logEntry.numberOfWorkingHours }} H</span>
                  </div>
                </td>
                <td>
                  <div class="location-cell">
                    <i class="pi pi-map-marker location-icon"></i>
                    <span>{{ getLocationText(logEntry.location) }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(logEntry.status)">
                    {{ getStatusText(logEntry.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <p-button 
                      icon="pi pi-star"
                      [text]="true"
                      severity="secondary"
                      size="small"
                      class="action-btn star-btn">
                    </p-button>
                    <p-button 
                      icon="pi pi-pencil"
                      [text]="true"
                      severity="secondary"
                      size="small"
                      class="action-btn edit-btn"
                      (onClick)="editLogEntry(logEntry)">
                    </p-button>
                    <p-button 
                      icon="pi pi-trash"
                      [text]="true"
                      severity="danger"
                      size="small"
                      class="action-btn delete-btn"
                      (onClick)="deleteLogEntry(logEntry.id)">
                    </p-button>
                    <p-button 
                      icon="pi pi-ellipsis-h"
                      [text]="true"
                      severity="secondary"
                      size="small"
                      class="action-btn menu-btn">
                    </p-button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center">
                  {{ 'student.internship.no_entries' | translate }}
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Log Entry Dialog -->
      <p-dialog 
        [header]="editingLog ? ('student.internship.edit_day' | translate) : ('student.internship.add_day_dialog' | translate)"
        [(visible)]="showDialog" 
        [modal]="true"
        [style]="{width: '600px'}"
        [closable]="true"
        [draggable]="false"
        styleClass="log-dialog">

        <div class="dialog-content">
          <div class="dialog-header-info">
            <span class="selected-date">{{ formatDialogDate(selectedDate) }}</span>
            <button type="button" class="close-btn" (click)="closeDialog()">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveLogEntry()" class="log-form">
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'student.internship.working_hours_label' | translate }}</label>
                <p-select
                  [options]="workingHoursOptions"
                  [(ngModel)]="logForm.numberOfWorkingHours"
                  name="workingHours"
                  [placeholder]="'student.internship.working_hours_label' | translate"
                  optionLabel="label"
                  optionValue="value"
                  [style]="{'width': '100%'}">
                </p-select>
              </div>
              
              <div class="form-group">
                <label>{{ 'student.internship.location_label' | translate }}</label>
                <p-select
                  [options]="locationOptions"
                  [(ngModel)]="logForm.location"
                  name="location"
                  [placeholder]="'student.internship.location_label' | translate"
                  optionLabel="label"
                  optionValue="value"
                  [style]="{'width': '100%'}">
                </p-select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ 'student.internship.status' | translate }}</label>
                <p-select
                  [options]="statusOptions"
                  [(ngModel)]="logForm.status"
                  name="status"
                  [placeholder]="'student.internship.status' | translate"
                  optionLabel="label"
                  optionValue="value"
                  [style]="{'width': '100%'}">
                </p-select>
              </div>
              <div class="form-group">
                <!-- Empty column for layout balance -->
              </div>
            </div>

            <div class="form-group">
              <h3>{{ 'student.internship.activity_description' | translate }}</h3>
              <textarea
                [placeholder]="'student.internship.activity_placeholder' | translate"
                [(ngModel)]="logForm.description"
                name="description"
                class="activity-textarea"
                rows="4">
              </textarea>
            </div>

            <div class="form-group">
              <h3>{{ 'student.internship.problems_challenges' | translate }}</h3>
              <textarea
                [placeholder]="'student.internship.problems_placeholder' | translate"
                [(ngModel)]="logForm.feedback"
                name="feedback"
                class="feedback-textarea"
                rows="4">
              </textarea>
            </div>

            <div class="dialog-actions">
              <p-button 
                [label]="'student.internship.submit' | translate"
                type="button"
                severity="secondary"
                [outlined]="true"
                (onClick)="submitLogEntry()">
              </p-button>
              <p-button 
                [label]="'student.internship.save' | translate"
                type="submit"
                [style]="{'background-color': '#007bff', 'border-color': '#007bff'}">
              </p-button>
            </div>
          </form>
        </div>
      </p-dialog>
    </div>
    <p-toast></p-toast>
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

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .diary-section {
      padding: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-container {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      font-size: 0.9rem;
    }

    .search-input {
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      min-width: 250px;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    /* Table Styling */
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

    .date-cell, .hours-cell, .location-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-icon {
      color: var(--primary-color);
    }

    .hours-icon {
      color: #6c757d;
    }

    .location-icon {
      color: #007bff;
    }

    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.obraden {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.u-tijeku {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.neobavljen {
      background: #f8d7da;
      color: #721c24;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .action-btn {
      min-width: auto !important;
      width: 2rem !important;
      height: 2rem !important;
    }

    ::ng-deep .star-btn .p-button {
      color: #ffc107;
    }

    ::ng-deep .edit-btn .p-button {
      color: var(--primary-color);
    }

    ::ng-deep .delete-btn .p-button {
      color: #dc3545;
    }

    ::ng-deep .menu-btn .p-button {
      color: #6c757d;
    }

    /* Dialog Styling */
    ::ng-deep .log-dialog .p-dialog-header {
      background: var(--primary-color);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .dialog-content {
      padding: 1rem 0;
    }

    .dialog-header-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .selected-date {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .close-btn {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .close-btn:hover {
      background: #f8f9fa;
    }

    .log-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label,
    .form-group h3 {
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
    }

    .activity-textarea,
    .feedback-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
    }

    .activity-textarea:focus,
    .feedback-textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    /* PrimeNG Component Overrides */
    ::ng-deep .p-select:not(.p-disabled).p-focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    ::ng-deep .p-checkbox .p-checkbox-box.p-highlight {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        min-width: 100%;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentInternshipComponent implements OnInit {
  logEntries: InternshipLogEntry[] = [];
  filteredLogEntries: InternshipLogEntry[] = [];
  loading = false;
  searchText = '';
  selectedLogs: string[] = [];
  selectAll = false;

  // Dialog properties
  showDialog = false;
  editingLog: InternshipLogEntry | null = null;
  selectedDate = new Date();

  // Form data
  logForm: Partial<CreateInternshipLogRequest> & { status?: InternshipLogStatus } = {
    numberOfWorkingHours: 8,
    location: WorkLocation.Onsite,
    description: '',
    feedback: '',
    status: InternshipLogStatus.InProgress
  };

  // Options
  workingHoursOptions = [
    { label: '1 H', value: 1 },
    { label: '2 H', value: 2 },
    { label: '3 H', value: 3 },
    { label: '4 H', value: 4 },
    { label: '5 H', value: 5 },
    { label: '6 H', value: 6 },
    { label: '7 H', value: 7 },
    { label: '8 H', value: 8 }
  ];

  locationOptions = [
    { label: 'Ured', value: WorkLocation.Onsite },
    { label: 'Od kuće', value: WorkLocation.Remote },
    { label: 'Teren', value: WorkLocation.Field }
  ];

  statusOptions = [
    { label: 'U tijeku', value: InternshipLogStatus.InProgress },
    { label: 'Neobavljen', value: InternshipLogStatus.Unfinished },
    { label: 'Obraden', value: InternshipLogStatus.Complete }
  ];

  constructor(
    private internshipLogService: InternshipLogService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.initializeOptions();
    this.loadLogEntries();
  }

  private initializeOptions(): void {
    this.workingHoursOptions = [
      { label: this.translationService.instant('student.internship.hours_1'), value: 1 },
      { label: this.translationService.instant('student.internship.hours_2'), value: 2 },
      { label: this.translationService.instant('student.internship.hours_3'), value: 3 },
      { label: this.translationService.instant('student.internship.hours_4'), value: 4 },
      { label: this.translationService.instant('student.internship.hours_5'), value: 5 },
      { label: this.translationService.instant('student.internship.hours_6'), value: 6 },
      { label: this.translationService.instant('student.internship.hours_7'), value: 7 },
      { label: this.translationService.instant('student.internship.hours_8'), value: 8 }
    ];

    this.locationOptions = [
      { label: this.translationService.instant('student.internship.location_office'), value: WorkLocation.Onsite },
      { label: this.translationService.instant('student.internship.location_home'), value: WorkLocation.Remote },
      { label: this.translationService.instant('student.internship.location_field'), value: WorkLocation.Field }
    ];

    this.statusOptions = [
      { label: this.translationService.instant('student.internship.status_working'), value: InternshipLogStatus.InProgress },
      { label: this.translationService.instant('student.internship.status_complete'), value: InternshipLogStatus.Complete },
      { label: this.translationService.instant('student.internship.status_unfinished'), value: InternshipLogStatus.Unfinished }
    ];
  }

  loadLogEntries(): void {
    this.loading = true;
    this.internshipLogService.getInternshipLogs().subscribe({
      next: (result) => {
        this.logEntries = result.internshipLogs;
        this.filterLogEntries();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translationService.instant('common.error'),
          detail: this.translationService.instant('student.internship.load_error')
        });
        this.loading = false;
      }
    });
  }

  filterLogEntries(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredLogEntries = [...this.logEntries];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredLogEntries = this.logEntries.filter(entry => 
        entry.description.toLowerCase().includes(searchLower) ||
        entry.feedback.toLowerCase().includes(searchLower) ||
        this.getLocationText(entry.location).toLowerCase().includes(searchLower) ||
        this.getStatusText(entry.status).toLowerCase().includes(searchLower)
      );
    }
  }

  openLogDialog(): void {
    this.editingLog = null;
    this.selectedDate = new Date();
    this.logForm = {
      numberOfWorkingHours: 8,
      location: WorkLocation.Onsite,
      description: '',
      feedback: '',
      status: InternshipLogStatus.InProgress
    };
    this.showDialog = true;
  }

  editLogEntry(logEntry: InternshipLogEntry): void {
    this.editingLog = logEntry;
    this.selectedDate = new Date(logEntry.date);
    this.logForm = {
      numberOfWorkingHours: logEntry.numberOfWorkingHours,
      location: this.parseWorkLocation(logEntry.location),
      description: logEntry.description,
      feedback: logEntry.feedback,
      status: this.parseInternshipLogStatus(logEntry.status)
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingLog = null;
  }

  saveLogEntry(): void {
    if (!this.logForm.numberOfWorkingHours || this.logForm.location === undefined || this.logForm.status === undefined) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translationService.instant('common.warning'),
        detail: this.translationService.instant('common.required_fields')
      });
      return;
    }

    const request: CreateInternshipLogRequest = {
      date: this.selectedDate.toISOString(),
      numberOfWorkingHours: this.logForm.numberOfWorkingHours!,
      location: this.logForm.location!,
      description: this.logForm.description || '',
      feedback: this.logForm.feedback || ''
    };

    if (this.editingLog) {
      // Update existing log
      const updateRequest: UpdateInternshipLogRequest = {
        ...request,
        id: this.editingLog.id,
        status: this.logForm.status!
      };
      
      this.internshipLogService.updateInternshipLog(updateRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('student.internship.save_success')
          });
          this.loadLogEntries();
          this.closeDialog();
        }
      });
    } else {
      // Create new log
      this.internshipLogService.createInternshipLog(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('student.internship.save_success')
          });
          this.loadLogEntries();
          this.closeDialog();
        }
      });
    }
  }

  submitLogEntry(): void {
    console.log('Submitting log entry for review');
    this.messageService.add({
      severity: 'info',
      summary: 'Predano',
      detail: 'Zapis je predan na pregled.'
    });
  }

  deleteLogEntry(id: string): void {
    this.internshipLogService.deleteInternshipLog(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('student.internship.delete_success')
        });
        this.loadLogEntries();
      }
    });
  }

  onSelectAllChange(event: any): void {
    if (event.checked) {
      this.selectedLogs = this.logEntries.map(log => log.id!);
    } else {
      this.selectedLogs = [];
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = this.getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  formatDialogDate(date: Date): string {
    const weekday = this.getWeekdayName(date.getDay());
    const day = date.getDate();
    const month = this.getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  }

  private getWeekdayName(dayIndex: number): string {
    const weekdays = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
    return weekdays[dayIndex];
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'sij', 'velj', 'ožu', 'tra', 'svi', 'lip',
      'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'
    ];
    return months[monthIndex];
  }

  getLocationText(location: WorkLocation | string): string {
    // Handle both string enum values from server and numeric enum values
    if (typeof location === 'string') {
      switch (location) {
        case 'Onsite': return this.translationService.instant('student.internship.location_office');
        case 'Remote': return this.translationService.instant('student.internship.location_home');
        case 'Field': return this.translationService.instant('student.internship.location_field');
        default: return this.translationService.instant('common.unknown');
      }
    } else {
      switch (location) {
        case WorkLocation.Onsite: return this.translationService.instant('student.internship.location_office');
        case WorkLocation.Remote: return this.translationService.instant('student.internship.location_home');
        case WorkLocation.Field: return this.translationService.instant('student.internship.location_field');
        default: return this.translationService.instant('common.unknown');
      }
    }
  }

  getStatusText(status: InternshipLogStatus | string): string {
    // Handle both string enum values from server and numeric enum values
    if (typeof status === 'string') {
      switch (status) {
        case 'Complete': return this.translationService.instant('student.internship.status_complete');
        case 'InProgress': return this.translationService.instant('student.internship.status_working');
        case 'Unfinished': return this.translationService.instant('student.internship.status_unfinished');
        default: return this.translationService.instant('common.unknown');
      }
    } else {
      switch (status) {
        case InternshipLogStatus.Complete: return this.translationService.instant('student.internship.status_complete');
        case InternshipLogStatus.InProgress: return this.translationService.instant('student.internship.status_working');
        case InternshipLogStatus.Unfinished: return this.translationService.instant('student.internship.status_unfinished');
        default: return this.translationService.instant('common.unknown');
      }
    }
  }

  getStatusClass(status: InternshipLogStatus | string): string {
    // Handle both string enum values from server and numeric enum values
    if (typeof status === 'string') {
      switch (status) {
        case 'Complete': return 'obraden';
        case 'InProgress': return 'u-tijeku';
        case 'Unfinished': return 'neobavljen';
        default: return '';
      }
    } else {
      switch (status) {
        case InternshipLogStatus.Complete: return 'obraden';
        case InternshipLogStatus.InProgress: return 'u-tijeku';
        case InternshipLogStatus.Unfinished: return 'neobavljen';
        default: return '';
      }
    }
  }

  // Helper functions to convert string enum values to numeric enum values
  private parseWorkLocation(location: WorkLocation | string): WorkLocation {
    if (typeof location === 'string') {
      switch (location) {
        case 'Onsite': return WorkLocation.Onsite;
        case 'Remote': return WorkLocation.Remote;
        case 'Field': return WorkLocation.Field;
        default: return WorkLocation.Onsite;
      }
    }
    return location;
  }

  private parseInternshipLogStatus(status: InternshipLogStatus | string): InternshipLogStatus {
    if (typeof status === 'string') {
      switch (status) {
        case 'Complete': return InternshipLogStatus.Complete;
        case 'InProgress': return InternshipLogStatus.InProgress;
        case 'Unfinished': return InternshipLogStatus.Unfinished;
        default: return InternshipLogStatus.InProgress;
      }
    }
    return status;
  }
} 