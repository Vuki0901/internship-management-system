import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  template: `
    <div class="register-main-container">
      <div class="register-container">
        <div class="register-card">
          <div class="logo-header">
            <img src="assets/images/aai-logo.png" alt="AAI@EduHr Logo" class="aai-logo">
          </div>
          <div class="subtitle">
            <p>Autentikacijska i autorizacijska infrastruktura znanosti i</p>
            <p>visokog obrazovanja u Republici Hrvatskoj</p>
          </div>
          <h2>Registracija studenta</h2>
          <form (ngSubmit)="onSubmit()" class="register-form">
            <div class="input-section">
              <h3>IME</h3>
              <div class="input-with-icon">
                <i class="fa-solid fa-user user-icon"></i>
                <input 
                  type="text" 
                  id="firstName" 
                  [(ngModel)]="firstName" 
                  name="firstName" 
                  required 
                  class="register-input"
                  placeholder="Unesite ime"
                >
              </div>
            </div>
            <div class="input-section">
              <h3>PREZIME</h3>
              <div class="input-with-icon">
                <i class="fa-solid fa-user user-icon"></i>
                <input 
                  type="text" 
                  id="lastName" 
                  [(ngModel)]="lastName" 
                  name="lastName" 
                  required 
                  class="register-input"
                  placeholder="Unesite prezime"
                >
              </div>
            </div>
            <div class="input-section">
              <h3>EMAIL ADRESA</h3>
              <div class="input-with-icon">
                <i class="fa-solid fa-envelope email-icon"></i>
                <input 
                  type="email" 
                  id="emailAddress" 
                  [(ngModel)]="emailAddress" 
                  name="emailAddress" 
                  required 
                  class="register-input"
                  placeholder="student@example.com"
                >
              </div>
            </div>
            <div class="input-section">
              <h3>ZAPORKA</h3>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock lock-icon"></i>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="register-input"
                  placeholder="Unesite zaporku"
                >
                <i 
                  [class]="'fa-solid ' + (showPassword ? 'fa-eye-slash' : 'fa-eye') + ' password-toggle-icon'"
                  (click)="togglePasswordVisibility()"
                  title="{{showPassword ? 'Sakrij zaporku' : 'Prikaži zaporku'}}"
                ></i>
              </div>
            </div>
            <button type="submit" class="register-button" [disabled]="isLoading">
              {{isLoading ? 'Registracija...' : 'Registriraj se'}}
            </button>
          </form>
          <div class="login-link">
            <p>Već imate račun? <a (click)="goToLogin()" class="link">Prijavite se</a></p>
          </div>
        </div>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .register-main-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      width: 100%;
      padding: 20px;
    }

    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 500px;
    }

    .register-card {
      background: white;
      padding: 3rem 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
      text-align: center;
    }

    .logo-header {
      margin-bottom: 1.5rem;
    }

    .aai-logo {
      max-width: 200px;
      height: auto;
    }

    .subtitle {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.4;
    }

    .subtitle p {
      margin: 0;
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 2rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-section {
      text-align: left;
    }

    .input-section h3 {
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.75rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .user-icon, .email-icon, .lock-icon {
      position: absolute;
      left: 15px;
      color: #666;
      font-size: 1.1rem;
      z-index: 1;
    }

    .password-toggle-icon {
      position: absolute;
      right: 15px;
      color: #666;
      font-size: 1.1rem;
      cursor: pointer;
      z-index: 1;
      transition: color 0.2s ease;
      user-select: none;
    }

    .password-toggle-icon:hover {
      color: var(--primary-color);
    }

    .register-input {
      width: 100%;
      padding: 1rem 1rem 1rem 45px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      color: #333;
      outline: none;
      background-color: #f8f9fa;
      transition: border-color 0.2s, background-color 0.2s;
      box-sizing: border-box;
    }

    .register-input:focus {
      border-color: var(--primary-color);
      background-color: white;
    }

    .register-input::placeholder {
      color: #999;
    }

    .register-button {
      background-color: var(--primary-color);
      color: white;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: 1rem;
      text-transform: none;
    }

    .register-button:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }

    .register-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .login-link {
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .login-link p {
      margin: 0;
    }

    .link {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .register-card {
        padding: 2rem 1.5rem;
      }
      
      .register-main-container {
        padding: 10px;
      }
    }
  `]
})
export class StudentRegisterComponent {
  firstName: string = '';
  lastName: string = '';
  emailAddress: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.emailAddress || !this.password) {
      return;
    }

    this.isLoading = true;
    
    const registerRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
      password: this.password
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Registration successful, user will be redirected by the service
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration failed:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/student/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
} 