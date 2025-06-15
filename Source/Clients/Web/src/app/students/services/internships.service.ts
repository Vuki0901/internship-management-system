import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface InternshipInformation {
  id: string;
  startDate?: string;
  endDate?: string;
  status: InternshipStatus;
  studyLevel: StudyLevel;
  createdOn: string;
  internshipProvider?: {
    id: string;
    name?: string;
    address?: string;
    contactEmailAddress?: string;
    contactPhoneNumber?: string;
  };
}

export interface GetInternshipsResult {
  internships: InternshipInformation[];
}

export interface Internship {
  id: string;
  startDate?: string;
  endDate?: string;
  status: InternshipStatus;
  studyLevel: StudyLevel;
  internshipProvider?: {
    id: string;
    name: string;
    address: string;
    contactEmailAddress: string;
    contactPhoneNumber: string;
  };
  studentId?: string;
  mentorId?: string;
}

export interface Response<T> {
  data: T;
}

export interface UpdateInternshipStatusRequest {
  internshipId: string;
  status: InternshipStatus;
}

export interface UpdateResult {
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipsService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInternships(): Observable<GetInternshipsResult> {
    return this.http.get<GetInternshipsResult>(`${this.API_BASE_URL}/students/internships`);
  }

  getInternshipById(internshipId: string): Observable<Response<Internship>> {
    return this.http.get<Response<Internship>>(`${this.API_BASE_URL}/students/internships/${internshipId}`);
  }

  markInternshipCompleted(internshipId: string): Observable<UpdateResult> {
    return this.http.put<UpdateResult>(`${this.API_BASE_URL}/students/internships/${internshipId}/complete`, {});
  }
} 