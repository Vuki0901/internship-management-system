import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { MessageService, ConfirmationService } from 'primeng/api';
import { DocumentService, DocumentDto, CreateDocumentRequest } from '../../shared/services/document.service';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    FileUploadModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressBarModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="documents-container">
      <div class="documents-header">
        <h1>Upravljanje dokumentima</h1>
        <p>Ovdje možete uploadovati i upravljati dokumentima koji će biti dostupni svim korisnicima sustava.</p>
      </div>

      <div class="documents-actions" *ngIf="canManageDocuments">
        <p-button 
          label="Učitaj novi dokument"
          icon="pi pi-upload"
          (onClick)="showUploadDialog = true">
        </p-button>
      </div>

      <!-- Documents Table -->
      <div class="documents-table">
        <p-table 
          [value]="filteredDocuments" 
          [loading]="loading"
          [paginator]="true" 
          [rows]="10">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Naziv datoteke</th>
              <th>Veličina</th>
              <th>Tip datoteke</th>
              <th>Učitao</th>
              <th>Datum učitavanja</th>
              <th style="width: 12rem">Akcije</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-document>
            <tr>
              <td>
                <div class="flex align-items-center gap-2">
                  <i [class]="getFileIcon(document.mimeType)" class="file-icon"></i>
                  <span>{{ document.fileName }}</span>
                </div>
              </td>
              <td>{{ formatFileSize(document.fileSize) }}</td>
              <td>
                <p-tag 
                  [value]="getFileTypeLabel(document.mimeType)"
                  [severity]="getFileTypeSeverity(document.mimeType)">
                </p-tag>
              </td>
              <td>{{ document.uploadedByName }}</td>
              <td>{{ formatDate(document.uploadedAt) }}</td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-download"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    (onClick)="downloadDocument(document)"
                    pTooltip="Preuzmi">
                  </p-button>
                  <p-button 
                    *ngIf="canManageDocuments"
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    size="small"
                    (onClick)="confirmDeleteDocument(document)"
                    pTooltip="Obriši">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                Nema dokumenata za prikaz.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Upload Dialog -->
      <p-dialog 
        header="Učitaj novi dokument"
        [(visible)]="showUploadDialog" 
        [modal]="true"
        [style]="{width: '600px'}">

        <div class="upload-dialog-content">
          <p-fileUpload
            mode="basic"
            [auto]="false"
            [multiple]="false"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.odt,.odp,.ods"
            [maxFileSize]="20971520"
            chooseLabel="Odaberi datoteku"
            (onSelect)="onFileSelect($event)"
            (onClear)="onFileClear()"
            [disabled]="uploading">
          </p-fileUpload>

          <div *ngIf="selectedFile" class="selected-file-info">
            <h4>Odabrana datoteka:</h4>
            <p><strong>Naziv:</strong> {{ selectedFile.name }}</p>
            <p><strong>Veličina:</strong> {{ formatFileSize(selectedFile.size) }}</p>
            <p><strong>Tip:</strong> {{ selectedFile.type }}</p>
          </div>

          <div *ngIf="uploading" class="upload-progress">
            <p-progressBar mode="indeterminate"></p-progressBar>
            <p>Učitavanje dokumenta...</p>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button 
            label="Odustani"
            severity="secondary"
            [outlined]="true"
            (onClick)="closeUploadDialog()"
            [disabled]="uploading">
          </p-button>
          <p-button 
            label="Učitaj"
            [disabled]="!selectedFile || uploading"
            [loading]="uploading"
            (onClick)="uploadDocument()">
          </p-button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 2rem;
    }

    .documents-header h1 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }

    .documents-actions {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .file-icon {
      color: var(--primary-color);
    }

    .selected-file-info {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 8px;
    }

    .upload-progress {
      margin-top: 1rem;
      text-align: center;
    }
  `]
})
export class DocumentsComponent implements OnInit {
  documents: DocumentDto[] = [];
  filteredDocuments: DocumentDto[] = [];
  loading = false;

  showUploadDialog = false;
  selectedFile: File | null = null;
  uploading = false;

  canManageDocuments = false;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadDocuments();
  }

  checkPermissions(): void {
    this.canManageDocuments = this.authService.hasRole('Administrator') || this.authService.hasRole('InternshipSupervisor');
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (response) => {
        this.documents = response.result;
        this.filteredDocuments = [...this.documents];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onFileClear(): void {
    this.selectedFile = null;
  }

  async uploadDocument(): Promise<void> {
    if (!this.selectedFile) return;

    this.uploading = true;

    try {
      const base64Content = await this.documentService.convertFileToBase64(this.selectedFile);
      
      const request: CreateDocumentRequest = {
        fileName: this.selectedFile.name,
        contentBase64: base64Content,
        mimeType: this.selectedFile.type
      };

      this.documentService.createDocument(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Uspjeh',
            detail: 'Dokument je uspješno učitan.'
          });
          this.closeUploadDialog();
          this.loadDocuments();
        },
        error: () => {
          this.uploading = false;
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Greška',
        detail: 'Greška prilikom čitanja datoteke.'
      });
      this.uploading = false;
    }
  }

  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.selectedFile = null;
    this.uploading = false;
  }

  downloadDocument(document: DocumentDto): void {
    this.documentService.getDocument(document.id).subscribe({
      next: (response) => {
        this.documentService.downloadFile(
          response.result.fileName,
          response.result.contentBase64,
          response.result.mimeType
        );
      }
    });
  }

  confirmDeleteDocument(document: DocumentDto): void {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati dokument "${document.fileName}"?`,
      header: 'Potvrda brisanja',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDocument(document);
      }
    });
  }

  deleteDocument(document: DocumentDto): void {
    this.documentService.deleteDocument(document.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspjeh',
          detail: 'Dokument je uspješno obrisan.'
        });
        this.loadDocuments();
      }
    });
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pi pi-file-pdf';
    if (mimeType.includes('word')) return 'pi pi-file-word';
    if (mimeType.includes('powerpoint')) return 'pi pi-file';
    if (mimeType.includes('excel')) return 'pi pi-file-excel';
    return 'pi pi-file';
  }

  getFileTypeLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('msword')) return 'DOC';
    if (mimeType.includes('wordprocessingml')) return 'DOCX';
    if (mimeType.includes('powerpoint')) return 'PPT';
    if (mimeType.includes('presentationml')) return 'PPTX';
    return 'DOC';
  }

  getFileTypeSeverity(mimeType: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    if (mimeType.includes('pdf')) return 'danger';
    if (mimeType.includes('word')) return 'info';
    if (mimeType.includes('powerpoint')) return 'warn';
    if (mimeType.includes('excel')) return 'success';
    return 'secondary';
  }
} 