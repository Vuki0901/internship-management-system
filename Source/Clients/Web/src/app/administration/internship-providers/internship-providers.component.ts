import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InternshipProviderService, InternshipProviderDto, CreateInternshipProviderRequest, UpdateInternshipProviderRequest } from '../services/internship-provider.service';

@Component({
  selector: 'app-internship-providers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Ponuditelji prakse</h1>
          <p>Upravljanje ponuditeljima prakse u sustavu</p>
        </div>
        <p-button 
          label="Dodaj ponuditelja"
          icon="pi pi-plus"
          [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}"
          (onClick)="openProviderDialog()">
        </p-button>
      </header>

      <div class="content-card">
        <div class="search-section">
          <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Pretraži ponuditelje prakse"
              class="search-input"
              [(ngModel)]="searchText"
              (ngModelChange)="filterProviders()">
          </div>
          <div class="stats-container">
            <div class="stat-item">
              <span class="stat-number">{{ filteredProviders.length }}</span>
              <span class="stat-label">Ukupno ponuditelja</span>
            </div>
          </div>
        </div>

        <p-table 
          [value]="filteredProviders" 
          [loading]="loading"
          [tableStyle]="{'min-width': '70rem'}"
          styleClass="p-datatable-gridlines">

          <ng-template pTemplate="header">
            <tr>
              <th>Naziv</th>
              <th>OIB</th>
              <th>Adresa</th>
              <th>Kontakt podaci</th>
              <th style="width: 12rem">Akcije</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-provider>
            <tr>
              <td>
                <div class="provider-cell">
                  <div class="provider-avatar">
                    {{ getProviderInitials(provider) }}
                  </div>
                  <div class="provider-info">
                    <span class="provider-name">{{ provider.name || '-' }}</span>
                  </div>
                </div>
              </td>
              <td>{{ provider.personalIdentificationNumber || '-' }}</td>
              <td>
                <span class="address-text">{{ provider.address || '-' }}</span>
              </td>
              <td>
                <div class="contact-info">
                  <div *ngIf="provider.contactEmailAddress" class="contact-item">
                    <i class="pi pi-envelope contact-icon"></i>
                    <span>{{ provider.contactEmailAddress }}</span>
                  </div>
                  <div *ngIf="provider.contactPhoneNumber" class="contact-item">
                    <i class="pi pi-phone contact-icon"></i>
                    <span>{{ provider.contactPhoneNumber }}</span>
                  </div>
                  <span *ngIf="!provider.contactEmailAddress && !provider.contactPhoneNumber" class="no-contact">Nema kontakt podataka</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-pencil"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    class="action-btn edit-btn"
                    (onClick)="editProvider(provider)"
                    pTooltip="Uredi">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    size="small"
                    class="action-btn delete-btn"
                    (onClick)="confirmDelete(provider)"
                    pTooltip="Obriši">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-building empty-icon"></i>
                  <h3>Nema ponuditelja prakse</h3>
                  <p>Dodajte prvi ponuditelja prakse u sustav</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Provider Dialog -->
      <p-dialog 
        [header]="editingProvider ? 'Uredi ponuditelja prakse' : 'Dodaj novog ponuditelja prakse'"
        [(visible)]="showProviderDialog" 
        [modal]="true"
        [style]="{width: '700px'}"
        [closable]="true"
        [draggable]="false"
        styleClass="provider-dialog">

        <div class="dialog-content">
          <form (ngSubmit)="saveProvider()" class="provider-form">
            <div class="form-section">
              <h4 class="section-title">Osnovni podaci</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Naziv ponuditelja *</label>
                  <input 
                    id="name"
                    type="text"
                    pInputText
                    [(ngModel)]="providerForm.name"
                    name="name"
                    required
                    class="w-full"
                    placeholder="Unesite naziv tvrtke ili organizacije">
                </div>
                
                <div class="form-group">
                  <label for="personalIdentificationNumber">OIB</label>
                  <input 
                    id="personalIdentificationNumber"
                    type="text"
                    pInputText
                    [(ngModel)]="providerForm.personalIdentificationNumber"
                    name="personalIdentificationNumber"
                    maxlength="11"
                    class="w-full"
                    placeholder="Unesite OIB (11 znamenki)">
                </div>
              </div>

              <div class="form-group mt-4">
                <label for="address">Adresa</label>
                <input 
                  id="address"
                  type="text"
                  pInputText
                  [(ngModel)]="providerForm.address"
                  name="address"
                  class="w-full"
                  placeholder="Unesite punu adresu">
              </div>
            </div>

            <div class="form-section">
              <h4 class="section-title">Kontakt podaci</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="contactEmailAddress">Email adresa</label>
                  <input 
                    id="contactEmailAddress"
                    type="email"
                    pInputText
                    [(ngModel)]="providerForm.contactEmailAddress"
                    name="contactEmailAddress"
                    class="w-full"
                    placeholder="kontakt@ponuditelj.hr">
                </div>
                
                <div class="form-group">
                  <label for="contactPhoneNumber">Broj telefona</label>
                  <input 
                    id="contactPhoneNumber"
                    type="tel"
                    pInputText
                    [(ngModel)]="providerForm.contactPhoneNumber"
                    name="contactPhoneNumber"
                    class="w-full"
                    placeholder="+385 1 234 5678">
                </div>
              </div>
            </div>

            <div class="dialog-actions">
              <p-button 
                label="Odustani"
                type="button"
                severity="secondary"
                [outlined]="true"
                (onClick)="closeProviderDialog()">
              </p-button>
              <p-button 
                label="Spremi"
                type="submit"
                [loading]="saving"
                [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}">
              </p-button>
            </div>
          </form>
        </div>
      </p-dialog>
    </div>
    
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
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .search-section {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-container {
      position: relative;
      max-width: 400px;
      flex: 1;
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
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    .stats-container {
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stat-label {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.25rem;
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

    .provider-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .provider-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #17a2b8, #138496);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .provider-name {
      font-weight: 600;
      color: var(--primary-color);
    }

    .address-text {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .contact-icon {
      color: #6c757d;
      font-size: 0.75rem;
      width: 12px;
    }

    .no-contact {
      color: #6c757d;
      font-style: italic;
      font-size: 0.85rem;
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

    ::ng-deep .edit-btn .p-button {
      color: var(--primary-color);
    }

    ::ng-deep .delete-btn .p-button {
      color: #dc3545;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--primary-color);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #6c757d;
      margin: 0;
    }

    /* Dialog Styling */
    ::ng-deep .provider-dialog .p-dialog-header {
      background: var(--primary-color);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .dialog-content {
      padding: 1rem 0;
    }

    .provider-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .section-title {
      margin: 0 0 1rem 0;
      color: var(--primary-color);
      font-size: 1.1rem;
      font-weight: 600;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 0.5rem;
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

    .form-group label {
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .text-center {
      text-align: center;
    }

    .w-full {
      width: 100%;
    }

    /* PrimeNG Component Overrides */
    ::ng-deep .p-inputtext:enabled:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-container {
        justify-content: center;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .dialog-actions {
        flex-direction: column;
      }
    }
  `]
})
export class InternshipProvidersComponent implements OnInit {
  providers: InternshipProviderDto[] = [];
  filteredProviders: InternshipProviderDto[] = [];
  loading = false;
  saving = false;
  searchText = '';

  // Dialog properties
  showProviderDialog = false;
  editingProvider: InternshipProviderDto | null = null;

  // Form data
  providerForm: Partial<CreateInternshipProviderRequest> = {
    name: '',
    personalIdentificationNumber: '',
    address: '',
    contactEmailAddress: '',
    contactPhoneNumber: ''
  };

  constructor(
    private providerService: InternshipProviderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading = true;
    this.providerService.getInternshipProviders().subscribe({
      next: (response) => {
        this.providers = response.result;
        this.filterProviders();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterProviders(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredProviders = [...this.providers];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredProviders = this.providers.filter(provider => 
        (provider.name && provider.name.toLowerCase().includes(searchLower)) ||
        (provider.personalIdentificationNumber && provider.personalIdentificationNumber.toLowerCase().includes(searchLower)) ||
        (provider.address && provider.address.toLowerCase().includes(searchLower)) ||
        (provider.contactEmailAddress && provider.contactEmailAddress.toLowerCase().includes(searchLower))
      );
    }
  }

  openProviderDialog(): void {
    this.editingProvider = null;
    this.providerForm = {
      name: '',
      personalIdentificationNumber: '',
      address: '',
      contactEmailAddress: '',
      contactPhoneNumber: ''
    };
    this.showProviderDialog = true;
  }

  editProvider(provider: InternshipProviderDto): void {
    this.editingProvider = provider;
    this.providerForm = {
      name: provider.name || '',
      personalIdentificationNumber: provider.personalIdentificationNumber || '',
      address: provider.address || '',
      contactEmailAddress: provider.contactEmailAddress || '',
      contactPhoneNumber: provider.contactPhoneNumber || ''
    };
    this.showProviderDialog = true;
  }

  closeProviderDialog(): void {
    this.showProviderDialog = false;
    this.editingProvider = null;
    this.saving = false;
  }

  saveProvider(): void {
    if (!this.providerForm.name || this.providerForm.name.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Naziv ponuditelja je obavezan.'
      });
      return;
    }

    this.saving = true;

    if (this.editingProvider) {
      // Update existing provider
      const updateRequest: UpdateInternshipProviderRequest = {
        id: this.editingProvider.id,
        name: this.providerForm.name!,
        personalIdentificationNumber: this.providerForm.personalIdentificationNumber || undefined,
        address: this.providerForm.address || undefined,
        contactEmailAddress: this.providerForm.contactEmailAddress || undefined,
        contactPhoneNumber: this.providerForm.contactPhoneNumber || undefined
      };
      
      this.providerService.updateInternshipProvider(updateRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Uspjeh',
            detail: 'Ponuditelj prakse je uspješno ažuriran.'
          });
          this.loadProviders();
          this.closeProviderDialog();
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Create new provider
      const createRequest: CreateInternshipProviderRequest = {
        name: this.providerForm.name!,
        personalIdentificationNumber: this.providerForm.personalIdentificationNumber || undefined,
        address: this.providerForm.address || undefined,
        contactEmailAddress: this.providerForm.contactEmailAddress || undefined,
        contactPhoneNumber: this.providerForm.contactPhoneNumber || undefined
      };
      
      this.providerService.createInternshipProvider(createRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Uspjeh',
            detail: 'Novi ponuditelj prakse je uspješno kreiran.'
          });
          this.loadProviders();
          this.closeProviderDialog();
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(provider: InternshipProviderDto): void {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati ponuditelja "${provider.name}"? Ova akcija se ne može poništiti.`,
      header: 'Potvrda brisanja',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da, obriši',
      rejectLabel: 'Odustani',
      accept: () => {
        this.deleteProvider(provider.id);
      }
    });
  }

  private deleteProvider(id: string): void {
    this.providerService.deleteInternshipProvider(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: 'Ponuditelj prakse je uspješno obrisan.'
        });
        this.loadProviders();
      }
    });
  }

  getProviderInitials(provider: InternshipProviderDto): string {
    if (!provider.name) {
      return 'P';
    }
    
    const words = provider.name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    
    return 'P';
  }
} 