import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum WorkLocation {
  Onsite = 1,
  Remote = 2, 
  Field = 3
}

export enum InternshipLogStatus {
  Complete = 1,
  InProgress = 2,
  Unfinished = 3
}

export interface InternshipLogEntry {
  id: string;
  date: string; // DateTimeOffset format
  numberOfWorkingHours: number;
  location: WorkLocation | string; // Server returns strings, forms use numeric enums
  description: string;
  feedback: string;
  status: InternshipLogStatus | string; // Server returns strings, forms use numeric enums
}

export interface CreateInternshipLogRequest {
  date: string;
  numberOfWorkingHours: number;
  location: WorkLocation;
  description: string;
  feedback: string;
}

export interface UpdateInternshipLogRequest extends CreateInternshipLogRequest {
  id: string;
  status: InternshipLogStatus;
}

export interface GetInternshipLogsResult {
  internshipLogs: InternshipLogEntry[];
}

export interface CreateOrUpdateEntityResult {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipLogService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInternshipLogs(): Observable<GetInternshipLogsResult> {
    return this.http.get<GetInternshipLogsResult>(`${this.API_BASE_URL}/students/internship-logs`);
  }

  createInternshipLog(request: CreateInternshipLogRequest): Observable<CreateOrUpdateEntityResult> {
    return this.http.post<CreateOrUpdateEntityResult>(`${this.API_BASE_URL}/students/internship-logs`, request);
  }

  updateInternshipLog(request: UpdateInternshipLogRequest): Observable<CreateOrUpdateEntityResult> {
    const { id, ...updateData } = request;
    return this.http.put<CreateOrUpdateEntityResult>(`${this.API_BASE_URL}/students/internship-logs/${id}`, updateData);
  }

  deleteInternshipLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/students/internship-logs/${id}`);
  }
} 