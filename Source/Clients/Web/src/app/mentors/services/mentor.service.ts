import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InternshipApplicationInfo {
  id: string;
  startDate?: string;
  status: InternshipStatus | string;
  studyLevel: StudyLevel | string;
  createdOn: string;
  studentId?: string;
  student?: StudentInfo;
  internshipProvider?: InternshipProviderInfo;
}

export interface StudentInfo {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  fullName?: string;
}

export interface InternshipProviderInfo {
  id: string;
  name?: string;
  address?: string;
  contactEmailAddress?: string;
  contactPhoneNumber?: string;
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

export enum ApplicationDecision {
  Accept = 1,
  Reject = 2
}

export interface GetInternshipApplicationsResponse {
  internshipApplications: InternshipApplicationInfo[];
}

export interface ManageInternshipApplicationRequest {
  internshipId: string;
  decision: ApplicationDecision;
}

export interface ManageInternshipApplicationResponse {
  entity: any;
}

export interface AssignedInternshipInfo {
  id: string;
  startDate?: string;
  endDate?: string;
  status: InternshipStatus | string;
  studyLevel: StudyLevel | string;
  createdOn: string;
  studentId?: string;
  student?: StudentInfo;
  internshipProvider?: InternshipProviderInfo;
}

export interface GetAssignedInternshipsResponse {
  internships: AssignedInternshipInfo[];
}

// Helper functions to convert string enums from API to numeric enums
export function parseInternshipStatus(status: string | number): InternshipStatus {
  if (typeof status === 'number') return status;
  
  switch (status) {
    case 'Pending': return InternshipStatus.Pending;
    case 'Accepted': return InternshipStatus.Accepted;
    case 'Rejected': return InternshipStatus.Rejected;
    case 'Completed': return InternshipStatus.Completed;
    default: return InternshipStatus.Pending;
  }
}

export function parseStudyLevel(studyLevel: string | number): StudyLevel {
  if (typeof studyLevel === 'number') return studyLevel;
  
  switch (studyLevel) {
    case 'Undergraduate': return StudyLevel.Undergraduate;
    case 'Graduate': return StudyLevel.Graduate;
    default: return StudyLevel.Undergraduate;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInternshipApplications(): Observable<GetInternshipApplicationsResponse> {
    return this.http.get<GetInternshipApplicationsResponse>(`${this.API_BASE_URL}/mentors/internship-applications`);
  }

  manageInternshipApplication(request: ManageInternshipApplicationRequest): Observable<ManageInternshipApplicationResponse> {
    return this.http.put<ManageInternshipApplicationResponse>(
      `${this.API_BASE_URL}/mentors/internship-applications/${request.internshipId}/manage`,
      { decision: request.decision }
    );
  }

  getAssignedInternships(): Observable<GetAssignedInternshipsResponse> {
    return this.http.get<GetAssignedInternshipsResponse>(`${this.API_BASE_URL}/mentors/internships`);
  }
} 