import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';
import { TranslationService } from '../services/translation.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="layout-container">
      <p-toast></p-toast>
      
      <!-- Mobile Topbar -->
      <header class="mobile-topbar">
        <button class="hamburger-btn" (click)="toggleSidebar()" [attr.aria-label]="'Toggle navigation menu'">
          <i class="fa-solid fa-bars"></i>
        </button>
        <h2 class="mobile-app-title">{{ 'app.title' | translate }}</h2>
        <button class="mobile-logout-btn" (click)="logout()" title="Logout">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      </header>

      <!-- Sidebar Overlay for Mobile -->
      <div class="sidebar-overlay" 
           [class.show]="isSidebarOpen" 
           (click)="closeSidebar()"></div>
      
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-header">
          <h2 class="app-title">{{ 'app.title' | translate }}</h2>
          <button class="sidebar-close-btn" (click)="closeSidebar()">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <i class="fa-solid fa-search search-icon"></i>
            <input type="text" [placeholder]="'common.search' | translate" class="search-input">
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of menuItems"
             [routerLink]="item.route" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{exact: item.route.endsWith('/dashboard')}"
             class="nav-item"
             (click)="onNavItemClick()">
            <i [class]="item.icon + ' nav-icon'"></i>
            <span>{{ item.label | translate }}</span>
          </a>
        </nav>

        <div class="language-section">
          <app-language-switcher></app-language-switcher>
        </div>

        <div class="user-section">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ userFullName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
          <button (click)="logout()" class="logout-btn" [title]="'common.logout' | translate">
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
      position: relative;
    }

    /* Mobile Topbar */
    .mobile-topbar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: white;
      align-items: center;
      padding: 0 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1001;
    }

    .hamburger-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .hamburger-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .mobile-app-title {
      flex: 1;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .mobile-logout-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .mobile-logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Sidebar Overlay */
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .sidebar-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: white;
      letter-spacing: 0.5px;
    }

    .sidebar-close-btn {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .sidebar-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
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



    .language-section {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: center;
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

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .mobile-topbar {
        display: flex;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
        width: 280px;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-close-btn {
        display: block;
      }

      .main-content {
        margin-top: 60px;
        width: 100%;
        height: calc(100vh - 60px);
        overflow-y: auto;
      }

      .layout-container {
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }
    }

    /* Tablet adjustments */
    @media (min-width: 769px) and (max-width: 1024px) {
      .sidebar {
        width: 250px;
      }
      
      .user-name {
        font-size: 0.85rem;
      }
    }

    /* Ensure mobile topbar doesn't show on desktop */
    @media (min-width: 769px) {
      .mobile-topbar {
        display: none !important;
      }
      
      .sidebar-overlay {
        display: none !important;
      }
      
      .sidebar-close-btn {
        display: none !important;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  userFullName: string = '';
  userInitials: string = '';
  userRole: string = '';
  menuItems: MenuItem[] = [];
  isSidebarOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Initialize translations first
    this.translationService.initializeLanguage();
    
    this.userFullName = this.authService.getUserFullName() || 'Unknown User';
    this.userInitials = this.authService.getUserInitials();
    this.setupRoleBasedMenu();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onNavItemClick(): void {
    // Close sidebar on mobile when a nav item is clicked
    if (window.innerWidth <= 768) {
      this.closeSidebar();
    }
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
        label: 'navigation.dashboard',
        icon: 'fa-solid fa-home',
        route: '/admin/dashboard'
      },
      {
        label: 'navigation.users',
        icon: 'fa-solid fa-users',
        route: '/admin/users'
      },
      {
        label: 'navigation.internship_providers',
        icon: 'fa-solid fa-building',
        route: '/admin/internship-providers'
      },
      {
        label: 'navigation.documents',
        icon: 'fa-solid fa-file-text',
        route: '/admin/documents'
      }
    ];
  }

  private buildStudentMenu(): void {
    this.userRole = 'Student';
    this.menuItems = [
      {
        label: 'navigation.dashboard',
        icon: 'fa-solid fa-home',
        route: '/student/dashboard'
      },
      {
        label: 'navigation.available_internships',
        icon: 'fa-solid fa-briefcase',
        route: '/student/internships'
      },
      {
        label: 'navigation.documents',
        icon: 'fa-solid fa-file-text',
        route: '/student/documents'
      },
      {
        label: 'navigation.my_internship',
        icon: 'fa-solid fa-user-tie',
        route: '/student/internship'
      }
    ];
  }

  private buildMentorMenu(): void {
    this.userRole = 'Mentor';
    this.menuItems = [
      {
        label: 'navigation.dashboard',
        icon: 'fa-solid fa-home',
        route: '/mentor/dashboard'
      },
      {
        label: 'navigation.internship_applications',
        icon: 'fa-solid fa-clipboard-list',
        route: '/mentor/applications'
      },
      {
        label: 'navigation.students',
        icon: 'fa-solid fa-user-graduate',
        route: '/mentor/students'
      },
      {
        label: 'navigation.documents',
        icon: 'fa-solid fa-file-text',
        route: '/mentor/documents'
      }
    ];
  }

  private buildSupervisorMenu(): void {
    this.userRole = 'Supervisor';
    this.menuItems = [
      {
        label: 'navigation.dashboard',
        icon: 'fa-solid fa-home',
        route: '/supervisor/dashboard'
      },
      {
        label: 'navigation.all_internships',
        icon: 'fa-solid fa-briefcase',
        route: '/supervisor/internships'
      },
      {
        label: 'navigation.pending_reports',
        icon: 'fa-solid fa-clock',
        route: '/supervisor/pending-reports'
      },
      {
        label: 'navigation.providers',
        icon: 'fa-solid fa-building',
        route: '/supervisor/providers'
      },
      {
        label: 'navigation.documents',
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