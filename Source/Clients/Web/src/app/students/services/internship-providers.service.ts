import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InternshipProvider {
  id: string;
  name: string;
  personalIdentificationNumber: string;
  address: string;
  contactEmailAddress: string;
  contactPhoneNumber: string;
}

export interface GetInternshipProvidersResult {
  internshipProviders: InternshipProvider[];
}

export enum StudyLevel {
  Undergraduate = 1,
  Graduate = 2
}

export interface ApplyForInternshipRequest {
  internshipProviderId: string;
  desiredStartDate: string; // ISO date string (YYYY-MM-DD)
  studyLevel: StudyLevel;
}

export interface CreateOrUpdateEntityResult {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipProvidersService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInternshipProviders(): Observable<GetInternshipProvidersResult> {
    return this.http.get<GetInternshipProvidersResult>(`${this.API_BASE_URL}/students/internship-providers`);
  }

  applyForInternship(request: ApplyForInternshipRequest): Observable<CreateOrUpdateEntityResult> {
    return this.http.post<CreateOrUpdateEntityResult>(`${this.API_BASE_URL}/students/apply-for-internship`, request);
  }
} 