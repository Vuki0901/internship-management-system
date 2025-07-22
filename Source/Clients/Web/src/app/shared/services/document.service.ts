import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentDto {
  id: string;
  fileName: string;
  uploadedByName: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentWithContentDto {
  id: string;
  fileName: string;
  contentBase64: string;
  uploadedByName: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

export interface CreateDocumentRequest {
  fileName: string;
  contentBase64: string;
  mimeType: string;
}

export interface CreateOrUpdateEntityResult {
  id: string;
}

export interface ApiResponse<T> {
  result: T;
  errors: any[];
  hasErrors: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<ApiResponse<DocumentDto[]>> {
    return this.http.get<ApiResponse<DocumentDto[]>>(`${this.API_BASE_URL}/documents`);
  }

  getDocument(id: string): Observable<ApiResponse<DocumentWithContentDto>> {
    return this.http.get<ApiResponse<DocumentWithContentDto>>(`${this.API_BASE_URL}/documents/${id}`);
  }

  createDocument(request: CreateDocumentRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/documents`, request);
  }

  deleteDocument(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_BASE_URL}/documents/${id}`);
  }

  // Helper method to convert file to base64
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Content = result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Helper method to download file from base64
  downloadFile(fileName: string, contentBase64: string, mimeType: string): void {
    const byteCharacters = atob(contentBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 