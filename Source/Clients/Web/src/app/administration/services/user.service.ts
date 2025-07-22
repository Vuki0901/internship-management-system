import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDto {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress: string;
  personalIdentificationNumber?: string;
  fullName?: string;
  createdOn: string;
  roles: UserRoleDto[];
}

export interface UserRoleDto {
  roleType: string;
  active: boolean;
  academicDegreeAbbreviation?: string; // For InternshipSupervisor
  internshipProviderName?: string; // For Mentor
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  personalIdentificationNumber?: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  password?: string;
  personalIdentificationNumber?: string;
}

// Role assignment interfaces
export interface SetAdministratorRoleRequest {
  userId: string;
}

export interface SetInternshipSupervisorRoleRequest {
  userId: string;
  academicDegreeAbbreviation: string;
}

export interface SetMentorRoleRequest {
  userId: string;
  internshipProviderId: string;
}

export interface InternshipProvider {
  id: string;
  name?: string;
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
export class UserService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<UserDto[]>> {
    return this.http.get<ApiResponse<UserDto[]>>(`${this.API_BASE_URL}/administration/users`);
  }

  getUserById(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.API_BASE_URL}/administration/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/users`, request);
  }

  updateUser(request: UpdateUserRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    const { id, ...updateData } = request;
    return this.http.put<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/users/${id}`, updateData);
  }

  // Role management methods
  setAdministratorRole(request: SetAdministratorRoleRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/users/${request.userId}/administrators`, {});
  }

  setInternshipSupervisorRole(request: SetInternshipSupervisorRoleRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/users/${request.userId}/internship-supervisors`, {
      academicDegreeAbbreviation: request.academicDegreeAbbreviation
    });
  }

  setMentorRole(request: SetMentorRoleRequest): Observable<ApiResponse<CreateOrUpdateEntityResult>> {
    return this.http.post<ApiResponse<CreateOrUpdateEntityResult>>(`${this.API_BASE_URL}/administration/users/${request.userId}/mentors`, {
      internshipProviderId: request.internshipProviderId
    });
  }

  // Get internship providers for mentor role assignment
  getInternshipProviders(): Observable<ApiResponse<InternshipProvider[]>> {
    return this.http.get<ApiResponse<InternshipProvider[]>>(`${this.API_BASE_URL}/administration/internship-providers`);
  }
} 