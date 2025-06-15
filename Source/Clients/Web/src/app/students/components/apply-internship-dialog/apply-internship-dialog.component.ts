import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InternshipProvider, InternshipProvidersService, ApplyForInternshipRequest, StudyLevel } from '../../services/internship-providers.service';

@Component({
  selector: 'app-apply-internship-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{width: '500px'}"
      [closable]="true"
      (onHide)="onCancel()"
      header="Prijava za praksu">
      
      <div class="dialog-content">
        <div class="field">
          <label for="provider">Odabrani pružatelj prakse:</label>
          <div class="provider-info">
            <strong>{{ selectedProvider?.name }}</strong>
            <div class="provider-details">
              <small>{{ selectedProvider?.address }}</small><br>
              <small>{{ selectedProvider?.contactEmailAddress }}</small>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="studyLevel">Razina studija *</label>
          <p-select 
            id="studyLevel"
            [(ngModel)]="formData.studyLevel" 
            [options]="studyLevelOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Odaberite razinu studija"
            [style]="{'width': '100%'}"
            [required]="true">
          </p-select>
        </div>

        <div class="field">
          <label for="startDate">Željeni datum početka *</label>
          <p-datepicker 
            appendTo="body"
            id="startDate"
            [(ngModel)]="formData.desiredStartDate"
            [showIcon]="true"
            [dateFormat]="'dd.mm.yy'"
            [minDate]="minDate"
            [style]="{'width': '100%'}"
            placeholder="Odaberite datum"
            [required]="true">
          </p-datepicker>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <p-button 
            label="Odustani" 
            [text]="true" 
            (onClick)="onCancel()">
          </p-button>
          <p-button 
            label="Prijavi se" 
            [loading]="submitting"
            [disabled]="!isFormValid()"
            (onClick)="onSubmit()">
          </p-button>
        </div>
      </ng-template>
    </p-dialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .dialog-content {
      padding: 1rem 0;
    }

    .field {
      margin-bottom: 1.5rem;
    }

    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .provider-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .provider-info strong {
      color: var(--primary-color);
      font-size: 1.1rem;
    }

    .provider-details {
      margin-top: 0.5rem;
      color: #666;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .field:last-child {
      margin-bottom: 0;
    }
  `]
})
export class ApplyInternshipDialogComponent {
  @Input() visible = false;
  @Input() selectedProvider: InternshipProvider | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() applicationSubmitted = new EventEmitter<void>();

  formData = {
    studyLevel: null as StudyLevel | null,
    desiredStartDate: null as Date | null
  };

  submitting = false;
  minDate = new Date();

  studyLevelOptions = [
    { label: 'Preddiplomski studij', value: StudyLevel.Undergraduate },
    { label: 'Diplomski studij', value: StudyLevel.Graduate }
  ];

  constructor(
    private internshipProvidersService: InternshipProvidersService,
    private messageService: MessageService
  ) {}

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  isFormValid(): boolean {
    return this.formData.studyLevel !== null && 
           this.formData.desiredStartDate !== null &&
           this.selectedProvider !== null;
  }

  onSubmit(): void {
    if (!this.isFormValid() || !this.selectedProvider) {
      return;
    }

    this.submitting = true;

    const request: ApplyForInternshipRequest = {
      internshipProviderId: this.selectedProvider.id,
      studyLevel: this.formData.studyLevel!,
      desiredStartDate: this.formatDateForApi(this.formData.desiredStartDate!)
    };

    this.internshipProvidersService.applyForInternship(request).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: 'Prijava za praksu je uspješno poslana!'
        });
        this.onCancel();
        this.applicationSubmitted.emit();
      },
      error: (error) => {
        console.error('Error applying for internship:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: error.error?.errors?.[0]?.message || 'Došlo je do greške prilikom prijave za praksu.'
        });
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  private formatDateForApi(date: Date): string {
    // Format date as YYYY-MM-DD for the API
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resetForm(): void {
    this.formData = {
      studyLevel: null,
      desiredStartDate: null
    };
  }
} 