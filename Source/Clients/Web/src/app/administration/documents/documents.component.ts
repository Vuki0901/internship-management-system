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
import { TranslateModule } from '@ngx-translate/core';

import { MessageService, ConfirmationService } from 'primeng/api';
import { DocumentService, DocumentDto, CreateDocumentRequest } from '../../shared/services/document.service';
import { AuthService } from '../../shared/auth/auth.service';
import { TranslationService } from '../../shared/services/translation.service';

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
    TooltipModule,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="documents-container">
      <div class="documents-header">
        <h1>{{ 'admin.documents.title' | translate }}</h1>
        <p>{{ 'admin.documents.subtitle' | translate }}</p>
      </div>

      <div class="documents-actions" *ngIf="canManageDocuments">
        <p-button 
          [label]="'admin.documents.upload_new_document' | translate"
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
              <th>{{ 'admin.documents.file_name' | translate }}</th>
              <th>{{ 'admin.documents.file_size' | translate }}</th>
              <th>{{ 'admin.documents.file_type' | translate }}</th>
              <th>{{ 'admin.documents.uploaded_by' | translate }}</th>
              <th>{{ 'admin.documents.upload_date' | translate }}</th>
              <th style="width: 12rem">{{ 'admin.documents.actions' | translate }}</th>
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
                    [pTooltip]="'admin.documents.download_tooltip' | translate">
                  </p-button>
                  <p-button 
                    *ngIf="canManageDocuments"
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    size="small"
                    (onClick)="confirmDeleteDocument(document)"
                    [pTooltip]="'admin.documents.delete_tooltip' | translate">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                {{ 'admin.documents.no_documents' | translate }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Upload Dialog -->
      <p-dialog 
        [header]="'admin.documents.upload_dialog_title' | translate"
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
            [chooseLabel]="'admin.documents.choose_file' | translate"
            (onSelect)="onFileSelect($event)"
            (onClear)="onFileClear()"
            [disabled]="uploading">
          </p-fileUpload>

          <div *ngIf="selectedFile" class="selected-file-info">
            <h4>{{ 'admin.documents.selected_file' | translate }}</h4>
            <p><strong>{{ 'admin.documents.file_name_label' | translate }}</strong> {{ selectedFile.name }}</p>
            <p><strong>{{ 'admin.documents.file_size_label' | translate }}</strong> {{ formatFileSize(selectedFile.size) }}</p>
            <p><strong>{{ 'admin.documents.file_type_label' | translate }}</strong> {{ selectedFile.type }}</p>
          </div>

          <div *ngIf="uploading" class="upload-progress">
            <p-progressBar mode="indeterminate"></p-progressBar>
            <p>{{ 'admin.documents.uploading_document' | translate }}</p>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button 
            [label]="'admin.documents.cancel_button' | translate"
            severity="secondary"
            [outlined]="true"
            (onClick)="closeUploadDialog()"
            [disabled]="uploading">
          </p-button>
          <p-button 
            [label]="'admin.documents.upload_button' | translate"
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
    private confirmationService: ConfirmationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
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
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('admin.documents.document_uploaded')
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
        summary: this.translationService.instant('common.error'),
        detail: this.translationService.instant('admin.documents.document_upload_error')
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
      message: this.translationService.instant('admin.documents.confirm_delete_document_message'),
      header: this.translationService.instant('admin.documents.confirm_delete_document'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.instant('common.yes'),
      rejectLabel: this.translationService.instant('common.cancel'),
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
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('admin.documents.document_deleted')
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