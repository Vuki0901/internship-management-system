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

export interface UpdateInternshipReportRequest {
  internshipId: string;
  mentorContent: string;
  grade: number | null;
  isConfirmedByMentor: boolean;
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
export class MentorReportService {
  private readonly baseUrl = `${environment.apiUrl}/mentors`;

  constructor(private http: HttpClient) {}

  getReport(internshipId: string): Observable<InternshipReport> {
    return this.http.get<InternshipReport>(`${this.baseUrl}/internships/${internshipId}/report`);
  }

  updateReport(request: UpdateInternshipReportRequest): Observable<CreateOrUpdateEntityResult> {
    return this.http.put<CreateOrUpdateEntityResult>(
      `${this.baseUrl}/internships/${request.internshipId}/report`, 
      request
    );
  }

  downloadReportPdf(internshipId: string): Observable<PdfDownloadResponse> {
    return this.http.get<PdfDownloadResponse>(`${this.baseUrl}/internships/${internshipId}/report/download`);
  }
} 