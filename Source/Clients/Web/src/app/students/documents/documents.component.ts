import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';

import { MessageService } from 'primeng/api';
import { DocumentService, DocumentDto } from '../../shared/services/document.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-student-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ProgressBarModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <div class="documents-container">
      <div class="overlay"></div>
      <div class="content-wrapper">
        <h1 class="title">{{ 'student.documents.title' | translate }}</h1>

        <div class="card">
          <ul class="documents-list" *ngIf="!loading; else loadingTpl">
            <li *ngFor="let document of filteredDocuments" (click)="downloadDocument(document)" class="document-item">
              <i [class]="getFileIcon(document.mimeType) + ' file-icon'"></i>
              <span class="file-name">{{ document.fileName }}</span>
            </li>
            <li *ngIf="!filteredDocuments.length" class="empty-message">
              {{ 'student.documents.no_documents' | translate }}
            </li>
          </ul>
        </div>

        <ng-template #loadingTpl>
          <div class="loading-wrapper">
            <p-progressBar mode="indeterminate" styleClass="progress-bar"></p-progressBar>
          </div>
        </ng-template>
      </div>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .documents-container {
      position: relative;
      min-height: 100%;
      background-image: url('/assets/images/documents-background.png');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 4rem 2rem;
      box-sizing: border-box;
    }

    /* Semi–transparent layer on top of the background so text stays readable */
    .overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(2px);
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 960px;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: #1e3a5f;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }

    .documents-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: #0d3b66;
      transition: color 0.2s;
      font-size: 1.05rem;
      padding: 0.75rem 0;
    }

    .document-item:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }

    .file-icon {
      margin-right: 0.9rem;
      font-size: 1.5rem;
      color: var(--primary-color);
    }

    .empty-message {
      color: var(--text-color-secondary);
      font-style: italic;
    }

    .loading-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .progress-bar {
      height: 6px;
    }
  `]
})
export class StudentDocumentsComponent implements OnInit {
  documents: DocumentDto[] = [];
  filteredDocuments: DocumentDto[] = [];
  loading = false;

  constructor(
    private documentService: DocumentService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.loadDocuments();
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