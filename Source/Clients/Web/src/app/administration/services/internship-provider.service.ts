import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InternshipProviderDto {
  id: string;
  name?: string;
  personalIdentificationNumber?: string;
  address?: string;
  contactEmailAddress?: string;
  contactPhoneNumber?: string;
}

export interface CreateInternshipProviderRequest {
  name: string;
  personalIdentificationNumber?: string;
  address?: string;
  contactEmailAddress?: string;
  contactPhoneNumber?: string;
}

export interface UpdateInternshipProviderRequest {
  id: string;
  name: string;
  personalIdentificationNumber?: string;
  address?: string;
  contactEmailAddress?: string;
  contactPhoneNumber?: string;
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
export class InternshipProviderService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInternshipProviders(): Observable<ApiResponse<InternshipProviderDto[]>> {
    return this.http.get<ApiResponse<InternshipProviderDto[]>>(`${this.API_BASE_URL}/administration/internship-providers`);
  }

  getInternshipProviderById(id: string): Observable<ApiResponse<InternshipProviderDto>> {
    return this.http.get<ApiResponse<InternshipProviderDto>>(`${this.API_BASE_URL}/administration/internship-providers/${id}`);
  }

  createInternshipProvider(request: CreateInternshipProviderRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/internship-providers`, request);
  }

  updateInternshipProvider(request: UpdateInternshipProviderRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    const { id, ...updateData } = request;
    return this.http.put<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/internship-providers/${id}`, updateData);
  }

  deleteInternshipProvider(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_BASE_URL}/administration/internship-providers/${id}`);
  }
} 