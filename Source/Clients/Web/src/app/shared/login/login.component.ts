import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, TranslateModule],
  template: `
    <div class="login-main-container">
      <!-- Role switching navigation -->
      <div class="role-switcher">
        <button 
          [class]="'role-switch-btn ' + (role === 'Student' ? 'active' : '')"
          (click)="switchRole('Student')">
          <i class="fa-solid fa-user-graduate"></i>
          {{ 'roles.student' | translate }}
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Mentor' ? 'active' : '')"
          (click)="switchRole('Mentor')">
          <i class="fa-solid fa-user-tie"></i>
          {{ 'roles.mentor' | translate }}
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Supervisor' ? 'active' : '')"
          (click)="switchRole('Supervisor')">
          <i class="fa-solid fa-user-check"></i>
          {{ 'roles.supervisor' | translate }}
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Admin' ? 'active' : '')"
          (click)="switchRole('Admin')">
          <i class="fa-solid fa-user-shield"></i>
          {{ 'roles.admin' | translate }}
        </button>
      </div>

      @if (role === 'Student') {
        <div class="student-login-container">
          <div class="student-login-card">
            <div class="logo-header">
              <img src="assets/images/aai-logo.png" alt="AAI@EduHr Logo" class="aai-logo">
            </div>
            <div class="subtitle">
              <p>{{ 'auth.aai_subtitle' | translate }}</p>
            </div>
            <form (ngSubmit)="onSubmit()" class="student-login-form">
              <div class="input-section">
                <h3>{{ 'auth.login.email_label' | translate }}</h3>
                <div class="input-with-icon">
                  <i class="fa-solid fa-user user-icon"></i>
                  <input 
                    type="email" 
                    id="email" 
                    [(ngModel)]="email" 
                    name="email" 
                    required 
                    class="student-input"
                  >
                </div>
              </div>
              <div class="input-section">
                <h3>{{ 'auth.login.password_label' | translate }}</h3>
                <div class="input-with-icon">
                  <i class="fa-solid fa-lock lock-icon"></i>
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    id="password" 
                    [(ngModel)]="password" 
                    name="password" 
                    required 
                    class="student-input"
                  >
                  <i 
                    [class]="'fa-solid ' + (showPassword ? 'fa-eye-slash' : 'fa-eye') + ' password-toggle'"
                    (click)="togglePasswordVisibility()"
                    [title]="showPassword ? ('auth.register.hide_password' | translate) : ('auth.register.show_password' | translate)">
                  </i>
                </div>
              </div>
              <button type="submit" class="student-login-button">{{ 'auth.login.login_button' | translate }}</button>
            </form>
            <div class="register-link" (click)="goToRegister()">
              <p>{{ 'auth.login.register_link' | translate }}</p>
            </div>
          </div>
        </div>
      } @else {
        <div class="other-roles-login-container">
          <div class="logo-section">
            <img src="assets/images/logo-full.png" alt="Fidit Praksa Logo" class="full-logo">
          </div>
          <div class="separator"></div>
          <div class="login-form-section">
            <h2>{{ 'common.welcome' | translate }}</h2>
            <p>{{ 'common.welcome_back' | translate }}</p>
            <form (ngSubmit)="onSubmit()" class="other-roles-login-form">
              <div class="form-group-icon">
                <i class="fa-solid fa-envelope"></i> <!-- Mail icon -->
                <input 
                  type="email" 
                  id="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  required 
                  [placeholder]="'auth.login.email_placeholder' | translate"
                >
              </div>
              <div class="form-group-icon">
                <i class="fa-solid fa-lock"></i> <!-- Lock icon -->
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  [placeholder]="'auth.login.password_placeholder' | translate"
                >
                <i 
                  [class]="'fa-solid ' + (showPassword ? 'fa-eye-slash' : 'fa-eye') + ' password-toggle'"
                  (click)="togglePasswordVisibility()"
                  [title]="showPassword ? ('auth.register.hide_password' | translate) : ('auth.register.show_password' | translate)">
                </i>
              </div>
              <button type="submit" class="other-roles-login-button">{{ 'auth.login.login_button' | translate }}</button>
            </form>
          </div>
        </div>
      }
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    /* Role switcher styles */
    .role-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      flex-wrap: wrap;
    }

    .role-switch-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #666;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .role-switch-btn:hover {
      background: rgba(var(--primary-color-rgb), 0.1);
      color: var(--primary-color);
    }

    .role-switch-btn.active {
      background: var(--primary-color);
      color: white;
    }

    .role-switch-btn i {
      font-size: 0.9rem;
    }

    /* Base styles for the entire login view */
    .login-main-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    /* Styles for Student Login (AAI@EduHr design) */
    .student-login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 500px;
    }

    .student-login-card {
      background: white;
      padding: 3rem 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
      text-align: center;
    }

    .logo-header {
      margin-bottom: 2rem;
    }

    .aai-logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 1rem auto;
      display: block;
    }

    .subtitle {
      margin-bottom: 3rem;
      color: #333;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .subtitle p {
      margin: 0.25rem 0;
      font-weight: 400;
    }

    .student-login-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .input-section h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.8rem;
      text-align: left;
      letter-spacing: 0.5px;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon input {
      pointer-events: auto;
      z-index: 1;
    }

    .user-icon, .lock-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      font-size: 1.1rem;
      z-index: 2;
      pointer-events: none;
    }

    .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      font-size: 1.1rem;
      cursor: pointer;
      z-index: 2;
      transition: color 0.2s ease;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .password-toggle:hover {
      color: var(--primary-color);
    }

    .student-input {
      width: 100%;
      padding: 1rem 45px 1rem 45px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      color: #333;
      outline: none;
      background-color: #f8f9fa;
      transition: border-color 0.2s, background-color 0.2s;
    }

    .student-input:focus {
      border-color: var(--primary-color);
      background-color: white;
    }

    .student-login-button {
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

    .student-login-button:hover {
      background-color: var(--primary-dark);
    }

    .register-link {
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .register-link p {
      margin: 0;
    }

    .register-link-btn {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link-btn:hover {
      text-decoration: underline;
    }

    /* Styles for Other Roles Login (Figma design) */
    .other-roles-login-container {
      display: flex;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
      max-width: 960px; /* Adjust based on Figma design for overall width */
      min-height: 600px; /* Change to min-height for flexibility */
    }

    .logo-section {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background-color: #ffffff;
      min-height: 200px; /* Ensure minimum height on mobile */
    }

    .full-logo {
      max-width: 250px; /* Adjust based on Figma design */
      height: auto;
    }

    .separator {
      width: 1px;
      background-color: #e0e0e0; /* Color from Figma design for separator */
      height: 100%;
    }

    .login-form-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3rem;
      background-color: #ffffff;
      font-family: 'Inter', sans-serif; /* Assuming Inter font from Figma */
      min-height: 400px; /* Ensure minimum height */
    }

    .login-form-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #212121; /* Dark text color from Figma */
      margin-bottom: 0.5rem;
    }

    .login-form-section p {
      font-size: 1rem;
      color: #666666;
      margin-bottom: 2rem;
    }

    .other-roles-login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-group-icon input {
      pointer-events: auto;
      z-index: 1;
    }

    .form-group-icon i:not(.password-toggle) {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #9e9e9e; /* Icon color from Figma */
      font-size: 1.2rem; /* Adjust icon size */
      z-index: 2;
      pointer-events: none;
    }

    .form-group-icon .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #9e9e9e;
      font-size: 1.2rem;
      cursor: pointer;
      z-index: 2;
      transition: color 0.2s ease;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .form-group-icon .password-toggle:hover {
      color: var(--primary-color);
    }

    .form-group-icon input {
      width: 100%;
      padding: 1rem 45px 1rem 45px; /* Adjust padding for both icons */
      border: 1px solid #e0e0e0;
      border-radius: 8px; /* Slightly more rounded corners */
      font-size: 1rem;
      color: #212121;
      outline: none;
    }

    .form-group-icon input::placeholder {
      color: #9e9e9e; /* Placeholder color from Figma */
    }

    .form-group-icon input:focus {
      border-color: #007bff; /* Focus border color */
    }

    .other-roles-login-button {
      background-color: var(--primary-color);
      color: white;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: 1rem;
    }

    .other-roles-login-button:hover {
      background-color: var(--primary-dark);
    }



    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .student-login-container {
        margin-top: 60px;
      }

      .login-main-container {
        padding: 10px;
        align-items: flex-start;
        padding-top: 90px; /* Much more compact spacing */
      }

      /* Role switcher mobile adjustments */
      .role-switcher {
        top: 10px;
        left: 10px;
        right: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.98);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .role-switch-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        min-height: 50px;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
      }

      .role-switch-btn i {
        font-size: 1.1rem;
        margin-bottom: 1px;
      }

      .role-switch-btn:hover {
        background: rgba(var(--primary-color-rgb), 0.1);
        transform: translateY(-1px);
      }

      .role-switch-btn.active {
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
      }

      /* Student login mobile adjustments */
      .student-login-card {
        padding: 2rem 1.5rem;
        margin: 0 10px;
      }

      .aai-logo {
        max-width: 150px;
      }

      .subtitle {
        font-size: 0.85rem;
        margin-bottom: 2rem;
      }

      .input-section h3 {
        font-size: 0.8rem;
      }

      .student-input {
        padding: 0.875rem 40px 0.875rem 40px;
        font-size: 0.9rem;
      }

      .user-icon, .lock-icon {
        left: 12px;
        font-size: 1rem;
      }

      .password-toggle {
        right: 12px;
        font-size: 1rem;
        width: 18px;
        height: 18px;
      }

      /* Other roles login mobile adjustments */
      .other-roles-login-container {
        flex-direction: column;
        width: 100%;
        max-width: none;
        min-height: auto;
        margin: 0 10px;
      }

      .logo-section {
        flex: none;
        padding: 1.5rem 1rem;
        min-height: 120px;
        border-bottom: 1px solid #e0e0e0;
      }

      .full-logo {
        max-width: 180px;
      }

      .separator {
        display: none; /* Hide separator on mobile */
      }

      .login-form-section {
        flex: none;
        padding: 2rem 1.5rem;
        min-height: auto;
      }

      .login-form-section h2 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .login-form-section p {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }

      .form-group-icon input {
        padding: 0.875rem 40px 0.875rem 40px;
        font-size: 0.9rem;
      }

      .form-group-icon i:not(.password-toggle) {
        left: 12px;
        font-size: 1.1rem;
      }

      .form-group-icon .password-toggle {
        right: 12px;
        font-size: 1.1rem;
        width: 18px;
        height: 18px;
      }

      .other-roles-login-button {
        padding: 0.875rem 1.25rem;
        font-size: 1rem;
      }
    }

    /* Small mobile screens */
    @media (max-width: 480px) {
      .login-main-container {
        padding: 5px;
        padding-top: 85px; /* More compact on small screens */
      }

      .role-switcher {
        top: 5px;
        left: 5px;
        right: 5px;
        padding: 6px;
        gap: 4px;
      }

      .role-switch-btn {
        padding: 10px 6px;
        font-size: 0.75rem;
        min-height: 44px;
      }

      .role-switch-btn i {
        font-size: 1rem;
      }

      .student-login-card {
        padding: 1.5rem 1rem;
        margin: 0;
      }

      .other-roles-login-container {
        margin: 60px 0 0 0;
      }

      .login-form-section {
        padding: 1.5rem 1rem;
      }

      .login-form-section h2 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  @Input() role: string = '';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private activatedRoute: ActivatedRoute,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Initialize translations first
    this.translationService.initializeLanguage();
    
    this.activatedRoute.data.subscribe(data => {
      if (data['role']) {
        this.role = data['role'];
      }
    });
  }

  onSubmit() {
    this.authService.login(this.role, { emailAddress: this.email, password: this.password })
      .subscribe({
        error: (err) => {
          console.error('Login failed:', err);
        }
      });
  }

  switchRole(newRole: string) {
    const roleRoutes = {
      'Student': '/student/login',
      'Mentor': '/mentor/login', 
      'Supervisor': '/supervisor/login',
      'Admin': '/admin/login'
    };
    
    const route = roleRoutes[newRole as keyof typeof roleRoutes];
    if (route) {
      this.router.navigate([route]);
    }
  }

  goToRegister() {
    this.router.navigate(['/student/register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
} 