import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { 
  InternshipSupervisorService, 
  InternshipProviderInfo
} from '../services/internship-supervisor.service';

@Component({
  selector: 'app-supervisor-providers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Ponuditelji prakse</h1>
        <p>Pregled svih ponuditelja prakse u sustavu</p>
      </header>

      <div class="content-wrapper">
        <p-card class="providers-card">
          <div class="providers-header">
            <h3>Lista ponuditelja ({{ filteredProviders.length }})</h3>
            <div class="search-section">
              <input 
                pInputText 
                [(ngModel)]="searchTerm" 
                placeholder="Pretraži po nazivu, adresi ili kontaktu..."
                (input)="filterProviders()"
                class="search-input">
              <i class="fa-solid fa-search search-icon"></i>
            </div>
          </div>

          @if (loading) {
            <div class="loading-container">
              <p-progressSpinner></p-progressSpinner>
              <p>Učitavanje ponuditelja...</p>
            </div>
          } @else if (filteredProviders.length === 0 && searchTerm) {
            <div class="no-results">
              <i class="fa-solid fa-search"></i>
              <h3>Nema rezultata</h3>
              <p>Nema ponuditelja koji odgovaraju vašem pretraživanju.</p>
            </div>
          } @else if (providers.length === 0) {
            <div class="no-providers">
              <i class="fa-solid fa-building"></i>
              <h3>Nema ponuditelja</h3>
              <p>Trenutno nema registriranih ponuditelja prakse.</p>
            </div>
          } @else {
            <p-table [value]="filteredProviders" [responsive]="true" [paginator]="true" [rows]="10">
              <ng-template pTemplate="header">
                <tr>
                  <th>Naziv</th>
                  <th>Adresa</th>
                  <th>Email</th>
                  <th>Telefon</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-provider>
                <tr>
                  <td>
                    <div class="provider-name">
                      <strong>{{ provider.name }}</strong>
                    </div>
                  </td>
                  <td>
                    <div class="provider-address">
                      {{ provider.address }}
                    </div>
                  </td>
                  <td>
                    <div class="provider-email">
                      <a [href]="'mailto:' + provider.contactEmailAddress" class="email-link">
                        {{ provider.contactEmailAddress }}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div class="provider-phone">
                      @if (provider.contactPhoneNumber) {
                        <a [href]="'tel:' + provider.contactPhoneNumber" class="phone-link">
                          {{ provider.contactPhoneNumber }}
                        </a>
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center">
                    <div class="empty-message">
                      <i class="fa-solid fa-search"></i>
                      <p>Nema ponuditelja koji odgovaraju vašem pretraživanju.</p>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
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
    }

    .providers-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .providers-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 2rem;
    }

    .providers-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .search-section {
      position: relative;
      min-width: 300px;
    }

    .search-input {
      width: 100%;
      padding-right: 2.5rem;
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      pointer-events: none;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .no-results, .no-providers {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-results i, .no-providers i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .no-providers i {
      color: var(--primary-color);
    }

    .no-results h3, .no-providers h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .provider-name strong {
      color: #333;
      font-size: 1rem;
    }

    .provider-address {
      color: #666;
      font-size: 0.9rem;
    }

    .email-link, .phone-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.9rem;
    }

    .email-link:hover, .phone-link:hover {
      text-decoration: underline;
    }

    .text-muted {
      color: #999;
      font-style: italic;
    }

    .empty-message {
      padding: 2rem;
      color: #666;
    }

    .empty-message i {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .text-center {
      text-align: center;
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

    :host ::ng-deep .p-paginator {
      margin-top: 1rem;
      border: none;
      background: transparent;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }

      .providers-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .search-section {
        min-width: auto;
      }
    }
  `]
})
export class SupervisorProvidersComponent implements OnInit {
  providers: InternshipProviderInfo[] = [];
  filteredProviders: InternshipProviderInfo[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private supervisorService: InternshipSupervisorService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading = true;
    
    this.supervisorService.getInternshipProviders().subscribe({
      next: (response) => {
        this.providers = response.internshipProviders;
        this.filteredProviders = [...this.providers];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.loading = false;
        this.showError('Greška pri učitavanju ponuditelja prakse.');
      }
    });
  }

  filterProviders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProviders = [...this.providers];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredProviders = this.providers.filter(provider =>
      provider.name.toLowerCase().includes(searchLower) ||
      provider.address.toLowerCase().includes(searchLower) ||
      provider.contactEmailAddress.toLowerCase().includes(searchLower) ||
      (provider.contactPhoneNumber && provider.contactPhoneNumber.toLowerCase().includes(searchLower))
    );
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