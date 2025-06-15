import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InternshipReport {
  id: string;
  internshipId: string;
  totalHoursWorked: number;
  totalLogEntries: number;
  mentorContent: string;
  grade: number | null;
  isConfirmedByMentor: boolean;
  confirmedAt: string | null;
  createdOn: string;
}

export interface GenerateInternshipReportRequest {
  internshipId: string;
}

export interface CreateOrUpdateEntityResult {
  id: string;
}

export interface PdfDownloadResponse {
  fileName: string;
  contentBase64: string;
  mimeType: string;
  fileSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipReportService {
  private readonly baseUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  generateReport(internshipId: string): Observable<CreateOrUpdateEntityResult> {
    return this.http.post<CreateOrUpdateEntityResult>(
      `${this.baseUrl}/internships/${internshipId}/generate-report`, 
      { internshipId }
    );
  }

  getReport(internshipId: string): Observable<InternshipReport> {
    return this.http.get<InternshipReport>(`${this.baseUrl}/internships/${internshipId}/report`);
  }

  downloadReportPdf(internshipId: string): Observable<PdfDownloadResponse> {
    return this.http.get<PdfDownloadResponse>(`${this.baseUrl}/internships/${internshipId}/report/download`);
  }
} 