import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface LoginRequest {
  emailAddress: string;
  password: string;
}

interface LoginResult {
  token: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
}

interface RegisterResult {
  token: string;
}

interface DecodedToken {
  role?: string[];
  Roles?: string[];
  FullName?: string;
  EmailAddress?: string;
  Id?: string;
  // Add other claims you might need here
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  login(role: string, request: LoginRequest): Observable<LoginResult> {
    let endpoint: string;
    
    switch (role.toLowerCase()) {
      case 'admin':
        endpoint = `${this.API_BASE_URL}/administration/login`;
        break;
      case 'student':
        endpoint = `${this.API_BASE_URL}/students/login`;
        break;
      case 'mentor':
        endpoint = `${this.API_BASE_URL}/mentors/login`;
        break;
      case 'supervisor':
        endpoint = `${this.API_BASE_URL}/internship-supervisors/login`;
        break;
      default:
        return throwError(() => new Error('Invalid role'));
    }

    return this.http.post<LoginResult>(endpoint, request).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          this.router.navigate([`/${role.toLowerCase()}/dashboard`]);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<RegisterResult> {
    const endpoint = `${this.API_BASE_URL}/students/register`;

    return this.http.post<RegisterResult>(endpoint, request).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          this.router.navigate(['/student/dashboard']);
        }
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getRoleFromToken(): string[] | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      console.log(decodedToken);
      if (decodedToken.Roles && decodedToken.Roles.length > 0) {
        // Filter out empty dummy roles that were added to force array behavior
        const validRoles = decodedToken.Roles.filter(role => role && role.trim() !== '');
        return validRoles.length > 0 ? validRoles : null;
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  hasRole(requiredRole: string): boolean {    
    return !!this.getRoleFromToken()?.map(_ => _.toLowerCase()).includes(requiredRole.toLowerCase())
  }

  getUserFullName(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.FullName || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.EmailAddress || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserInitials(): string {
    const fullName = this.getUserFullName();
    if (!fullName) {
      return 'U';
    }
    
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    
    return 'U';
  }
} 