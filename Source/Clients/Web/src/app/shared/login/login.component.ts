import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  template: `
    <div class="login-main-container">
      <!-- Role switching navigation -->
      <div class="role-switcher">
        <button 
          [class]="'role-switch-btn ' + (role === 'Student' ? 'active' : '')"
          (click)="switchRole('Student')">
          <i class="fa-solid fa-user-graduate"></i>
          Student
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Mentor' ? 'active' : '')"
          (click)="switchRole('Mentor')">
          <i class="fa-solid fa-user-tie"></i>
          Mentor
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Supervisor' ? 'active' : '')"
          (click)="switchRole('Supervisor')">
          <i class="fa-solid fa-user-check"></i>
          Supervisor
        </button>
        <button 
          [class]="'role-switch-btn ' + (role === 'Admin' ? 'active' : '')"
          (click)="switchRole('Admin')">
          <i class="fa-solid fa-user-shield"></i>
          Admin
        </button>
      </div>

      @if (role === 'Student') {
        <div class="student-login-container">
          <div class="student-login-card">
            <div class="logo-header">
              <img src="assets/images/aai-logo.png" alt="AAI@EduHr Logo" class="aai-logo">
            </div>
            <div class="subtitle">
              <p>Autentikacijska i autorizacijska infrastruktura znanosti i</p>
              <p>visokog obrazovanja u Republici Hrvatskoj</p>
            </div>
            <form (ngSubmit)="onSubmit()" class="student-login-form">
              <div class="input-section">
                <h3>KORISNIČKA OZNAKA</h3>
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
                <h3>ZAPORKA</h3>
                <div class="input-with-icon">
                  <i class="fa-solid fa-lock lock-icon"></i>
                  <input 
                    type="password" 
                    id="password" 
                    [(ngModel)]="password" 
                    name="password" 
                    required 
                    class="student-input"
                  >
                </div>
              </div>
              <button type="submit" class="student-login-button">Prijava</button>
            </form>
          </div>
        </div>
      } @else {
        <div class="other-roles-login-container">
          <div class="logo-section">
            <img src="assets/images/logo-full.png" alt="Fidit Praksa Logo" class="full-logo">
          </div>
          <div class="separator"></div>
          <div class="login-form-section">
            <h2>Pozdrav!</h2>
            <p>Dobro došli natrag</p>
            <form (ngSubmit)="onSubmit()" class="other-roles-login-form">
              <div class="form-group-icon">
                <i class="fa-solid fa-envelope"></i> <!-- Mail icon -->
                <input 
                  type="email" 
                  id="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  required 
                  placeholder="pliva@pliva.hr"
                >
              </div>
              <div class="form-group-icon">
                <i class="fa-solid fa-lock"></i> <!-- Lock icon -->
                <input 
                  type="password" 
                  id="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  placeholder="Lozinka"
                >
              </div>
              <button type="submit" class="other-roles-login-button">Prijava</button>
              <a href="#" class="forgot-password-link">Zaboravili ste lozinku?</a>
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

    .user-icon, .lock-icon {
      position: absolute;
      left: 15px;
      color: #666;
      font-size: 1.1rem;
      z-index: 1;
    }

    .student-input {
      width: 100%;
      padding: 1rem 1rem 1rem 45px;
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

    /* Styles for Other Roles Login (Figma design) */
    .other-roles-login-container {
      display: flex;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
      width: 90%;
      max-width: 960px; /* Adjust based on Figma design for overall width */
      height: 600px; /* Adjust based on Figma design for overall height */
    }

    .logo-section {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background-color: #ffffff;
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

    .form-group-icon i {
      position: absolute;
      left: 15px;
      color: #9e9e9e; /* Icon color from Figma */
      font-size: 1.2rem; /* Adjust icon size */
    }

    .form-group-icon input {
      width: 100%;
      padding: 1rem 1rem 1rem 45px; /* Adjust padding for icon */
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

    .forgot-password-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #007bff; /* Link color */
      text-decoration: none;
      font-size: 0.9rem;
    }

    .forgot-password-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  @Input() role: string = '';
  email: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
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
} 