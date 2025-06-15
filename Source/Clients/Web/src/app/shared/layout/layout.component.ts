import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  hasNotification?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule, RouterModule],
  template: `
    <div class="layout-container">
      <p-toast></p-toast>
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="app-title">FIDIT praksa</h2>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <i class="fa-solid fa-search search-icon"></i>
            <input type="text" placeholder="Pretraživanje" class="search-input">
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of menuItems"
             [routerLink]="item.route" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{exact: item.route.endsWith('/dashboard')}"
             class="nav-item">
            <i [class]="item.icon + ' nav-icon'"></i>
            <span>{{ item.label }}</span>
            <span class="notification-dot" *ngIf="item.hasNotification"></span>
          </a>
        </nav>

        <div class="user-section">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ userFullName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
          <button (click)="logout()" class="logout-btn" title="Logout">
            <i class="fa-solid fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      font-family: 'Roboto', sans-serif;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: white;
      letter-spacing: 0.5px;
    }

    .search-section {
      padding: 1rem 1.5rem;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: none;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.9rem;
      outline: none;
      transition: background-color 0.2s;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .search-input:focus {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.5rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.875rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      position: relative;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: white;
    }

    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.12);
      color: white;
      border-left-color: #ffffff;
      font-weight: 500;
    }

    .nav-icon {
      width: 20px;
      text-align: center;
      margin-right: 0.875rem;
      font-size: 1rem;
    }

    .notification-dot {
      width: 8px;
      height: 8px;
      background-color: #e74c3c;
      border-radius: 50%;
      margin-left: auto;
    }

    .user-section {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 0.125rem;
    }

    .logout-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .logout-btn:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .main-content {
      flex: 1;
      background-color: #f8f9fa;
      overflow-y: auto;
      position: relative;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sidebar {
        width: 250px;
      }
      
      .user-name {
        font-size: 0.85rem;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  userFullName: string = '';
  userInitials: string = '';
  userRole: string = '';
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userFullName = this.authService.getUserFullName() || 'Unknown User';
    this.userInitials = this.authService.getUserInitials();
    this.setupRoleBasedMenu();
  }

  private setupRoleBasedMenu(): void {
    // Determine context from the first URL segment so that the UI
    // reflects the portal we logged into (student / admin / mentor),
    // even when a user has multiple roles.

    const firstSegment = this.router.url.startsWith('/')
      ? this.router.url.split('/')[1]
      : this.router.url.split('/')[0];

    switch (firstSegment) {
      case 'admin':
        this.buildAdminMenu();
        break;
      case 'student':
        this.buildStudentMenu();
        break;
      case 'mentor':
        this.buildMentorMenu();
        break;
      case 'supervisor':
        this.buildSupervisorMenu();
        break;
      default:
        // Fall back to role-based menu (original logic)
        if (this.authService.hasRole('Administrator')) {
          this.buildAdminMenu();
        } else if (this.authService.hasRole('Student')) {
          this.buildStudentMenu();
        } else if (this.authService.hasRole('Mentor')) {
          this.buildMentorMenu();
        } else if (this.authService.hasRole('InternshipSupervisor')) {
          this.buildSupervisorMenu();
        } else {
          // unknown
          this.userRole = 'Unknown';
          this.menuItems = [
            {
              label: 'Početna',
              icon: 'fa-solid fa-home',
              route: '/dashboard'
            }
          ];
        }
        break;
    }
  }

  private buildAdminMenu(): void {
    this.userRole = 'Administrator';
    this.menuItems = [
      {
        label: 'Početna',
        icon: 'fa-solid fa-home',
        route: '/admin/dashboard',
        hasNotification: true
      },
      {
        label: 'Korisnici',
        icon: 'fa-solid fa-users',
        route: '/admin/users'
      },
      {
        label: 'Ponuditelji prakse',
        icon: 'fa-solid fa-building',
        route: '/admin/internship-providers'
      },
      {
        label: 'Dokumenti',
        icon: 'fa-solid fa-file-text',
        route: '/admin/documents'
      }
    ];
  }

  private buildStudentMenu(): void {
    this.userRole = 'Student';
    this.menuItems = [
      {
        label: 'Početna',
        icon: 'fa-solid fa-home',
        route: '/student/dashboard',
        hasNotification: true
      },
      {
        label: 'Dostupna praksa',
        icon: 'fa-solid fa-briefcase',
        route: '/student/internships'
      },
      {
        label: 'Dokumenti',
        icon: 'fa-solid fa-file-text',
        route: '/student/documents'
      },
      {
        label: 'Moja praksa',
        icon: 'fa-solid fa-user-tie',
        route: '/student/internship',
        hasNotification: true
      }
    ];
  }

  private buildMentorMenu(): void {
    this.userRole = 'Mentor';
    this.menuItems = [
      {
        label: 'Početna',
        icon: 'fa-solid fa-home',
        route: '/mentor/dashboard'
      },
      {
        label: 'Zahtjevi za praksu',
        icon: 'fa-solid fa-clipboard-list',
        route: '/mentor/applications',
        hasNotification: true
      },
      {
        label: 'Studenti',
        icon: 'fa-solid fa-user-graduate',
        route: '/mentor/students'
      },
      {
        label: 'Dokumenti',
        icon: 'fa-solid fa-file-text',
        route: '/mentor/documents'
      }
    ];
  }

  private buildSupervisorMenu(): void {
    this.userRole = 'Supervisor';
    this.menuItems = [
      {
        label: 'Početna',
        icon: 'fa-solid fa-home',
        route: '/supervisor/dashboard'
      },
      {
        label: 'Sve prakse',
        icon: 'fa-solid fa-briefcase',
        route: '/supervisor/internships'
      },
      {
        label: 'Čekaju ocjenu',
        icon: 'fa-solid fa-clock',
        route: '/supervisor/pending-reports',
        hasNotification: true
      },
      {
        label: 'Ponuditelji prakse',
        icon: 'fa-solid fa-building',
        route: '/supervisor/providers'
      },
      {
        label: 'Dokumenti',
        icon: 'fa-solid fa-file-text',
        route: '/supervisor/documents'
      }
    ];
  }

  logout(): void {
    // Clear token first
    this.authService.logout();

    const firstSegment = this.router.url.startsWith('/')
      ? this.router.url.split('/')[1]
      : this.router.url.split('/')[0];

    let target: string;
    switch (firstSegment) {
      case 'admin':
        target = '/admin/login';
        break;
      case 'mentor':
        target = '/mentor/login';
        break;
      case 'supervisor':
        target = '/supervisor/login';
        break;
      case 'student':
      default:
        target = '/student/login';
        break;
    }

    this.router.navigate([target]);
  }
} 