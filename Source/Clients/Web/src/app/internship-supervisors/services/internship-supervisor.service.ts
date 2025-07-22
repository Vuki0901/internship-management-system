import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces for API responses
export interface InternshipInformation {
  id: string;
  startDate?: string;
  endDate?: string;
  status: InternshipStatus | string | number;
  studyLevel: StudyLevel | string | number;
  createdOn: string;
  studentId?: string;
  student?: StudentInfo;
  mentorId?: string;
  mentor?: MentorInfo;
  internshipProvider?: InternshipProviderInfo;
}

export interface StudentInfo {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress: string;
  fullName?: string;
}

export interface MentorInfo {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress: string;
  fullName?: string;
}

export interface InternshipProviderInfo {
  id: string;
  name: string;
  address: string;
  contactEmailAddress: string;
  contactPhoneNumber: string;
}

export interface GetInternshipsResponse {
  internships: InternshipInformation[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetInternshipProvidersResponse {
  internshipProviders: InternshipProviderInfo[];
}

export interface PendingReportInfo {
  reportId: string;
  internshipId: string;
  totalHoursWorked: number;
  totalLogEntries: number;
  confirmedAt: string;
  createdOn: string;
  internship: {
    id: string;
    startDate?: string;
    endDate?: string;
    status: InternshipStatus | string | number;
    studyLevel: StudyLevel | string | number;
    createdOn: string;
    student?: StudentInfo;
    mentor?: MentorInfo;
    internshipProvider?: InternshipProviderInfo;
  };
}

export interface GetPendingReportsResponse {
  pendingReports: PendingReportInfo[];
}

export interface InternshipReport {
  id: string;
  internshipId: string;
  totalHoursWorked: number;
  totalLogEntries: number;
  mentorContent?: string;
  grade?: number;
  isConfirmedByMentor: boolean;
  confirmedAt?: string;
  createdOn: string;
  internship: InternshipInformation;
}

export interface GradeReportRequest {
  internshipId: string;
  grade: number;
}

export interface GradeReportResponse {
  success: boolean;
  message?: string;
}

export interface PdfDownloadResponse {
  fileName: string;
  contentBase64: string;
  mimeType: string;
  fileSize: number;
}

export enum InternshipStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Completed = 4
}

export enum StudyLevel {
  Undergraduate = 1,
  Graduate = 2
}

@Injectable({
  providedIn: 'root'
})
export class InternshipSupervisorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all internships with pagination and filtering
  getInternships(
    page: number = 1,
    pageSize: number = 10,
    status?: InternshipStatus,
    internshipProviderId?: string,
    searchTerm?: string
  ): Observable<GetInternshipsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    if (internshipProviderId) {
      params = params.set('internshipProviderId', internshipProviderId);
    }
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<GetInternshipsResponse>(`${this.apiUrl}/internship-supervisors/internships`, { params });
  }

  // Get all internship providers
  getInternshipProviders(): Observable<GetInternshipProvidersResponse> {
    return this.http.get<GetInternshipProvidersResponse>(`${this.apiUrl}/internship-supervisors/internship-providers`);
  }

  // Get pending reports (confirmed by mentors but not graded)
  getPendingReports(): Observable<GetPendingReportsResponse> {
    return this.http.get<GetPendingReportsResponse>(`${this.apiUrl}/internship-supervisors/pending-reports`);
  }

  // Get specific internship report
  getInternshipReport(internshipId: string): Observable<InternshipReport> {
    return this.http.get<InternshipReport>(`${this.apiUrl}/internship-supervisors/internships/${internshipId}/report`);
  }

  // Grade an internship report
  gradeInternshipReport(internshipId: string, grade: number): Observable<GradeReportResponse> {
    const request: GradeReportRequest = { 
      internshipId: internshipId,
      grade: grade 
    };
    return this.http.put<GradeReportResponse>(`${this.apiUrl}/internship-supervisors/internships/${internshipId}/report/grade`, request);
  }

  // Download internship report as PDF
  downloadInternshipReportPdf(internshipId: string): Observable<PdfDownloadResponse> {
    return this.http.get<PdfDownloadResponse>(`${this.apiUrl}/internship-supervisors/internships/${internshipId}/report/download`);
  }
} 