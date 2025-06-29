import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, UserDto, UserRoleDto, CreateUserRequest, UpdateUserRequest, InternshipProvider, SetAdministratorRoleRequest, SetInternshipSupervisorRoleRequest, SetMentorRoleRequest } from '../services/user.service';
import { TagModule } from 'primeng/tag';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    CheckboxModule,
    StepperModule,
    CardModule,
    BadgeModule,
    TagModule,
    TranslateModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>{{ 'admin.users.title' | translate }}</h1>
        <p-button 
          [label]="'admin.users.add_user' | translate"
          icon="pi pi-plus"
          [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}"
          (onClick)="openUserDialog()">
        </p-button>
      </header>

      <div class="content-card">
        <div class="search-section">
          <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              [placeholder]="'admin.users.search_users' | translate"
              class="search-input"
              [(ngModel)]="searchText"
              (ngModelChange)="filterUsers()">
          </div>
        </div>

        <p-table 
          [value]="filteredUsers" 
          [loading]="loading"
          [tableStyle]="{'min-width': '70rem'}"
          styleClass="p-datatable-gridlines">

          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'admin.users.full_name' | translate }}</th>
              <th>{{ 'admin.users.email_address' | translate }}</th>
              <th>{{ 'admin.users.oib' | translate }}</th>
              <th>{{ 'admin.users.roles' | translate }}</th>
              <th>{{ 'admin.users.created_date' | translate }}</th>
              <th style="width: 12rem">{{ 'admin.users.actions' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-user>
            <tr>
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ getUserInitials(user) }}
                  </div>
                  <span>{{ user.fullName || (user.firstName + ' ' + user.lastName) }}</span>
                </div>
              </td>
              <td>{{ user.emailAddress }}</td>
              <td>{{ user.personalIdentificationNumber || '-' }}</td>
              <td>
                <div class="flex align-items-center gap-1 flex-wrap">
                  <ng-container *ngFor="let role of user.roles">
                    <p-tag 
                      [value]="getRoleDisplayText(role.roleType)"
                      [icon]="getRoleIcon(role.roleType)"
                      [severity]="getRoleSeverity(role.roleType)"
                      class="text-xs"
                    ></p-tag>
                  </ng-container>
                  <span *ngIf="!user.roles || user.roles.length === 0" class="text-500 text-sm">{{ 'admin.users.no_roles' | translate }}</span>
                </div>
              </td>
              <td>{{ formatDate(user.createdOn) }}</td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-pencil"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    class="action-btn edit-btn"
                    (onClick)="editUser(user)"
                    [pTooltip]="'admin.users.edit_tooltip' | translate">
                  </p-button>
                  <p-button 
                    icon="pi pi-users"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    class="action-btn roles-btn"
                    (onClick)="manageUserRoles(user)"
                    [pTooltip]="'admin.users.manage_roles_tooltip' | translate">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                {{ 'admin.users.no_users' | translate }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- User Dialog -->
      <p-dialog 
        [header]="editingUser ? ('admin.users.edit_user' | translate) : ('admin.users.add_new_user' | translate)"
        [(visible)]="showUserDialog" 
        [modal]="true"
        [style]="{width: '600px'}"
        [closable]="true"
        [draggable]="false"
        styleClass="user-dialog">

        <div class="dialog-content">
          <form (ngSubmit)="saveUser()" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">{{ 'admin.users.first_name' | translate }} *</label>
                <input 
                  id="firstName"
                  type="text"
                  pInputText
                  [(ngModel)]="userForm.firstName"
                  name="firstName"
                  required
                  class="w-full">
              </div>
              
              <div class="form-group">
                <label for="lastName">{{ 'admin.users.last_name' | translate }} *</label>
                <input 
                  id="lastName"
                  type="text"
                  pInputText
                  [(ngModel)]="userForm.lastName"
                  name="lastName"
                  required
                  class="w-full">
              </div>
            </div>

            <div class="form-group">
              <label for="emailAddress">{{ 'admin.users.email_required' | translate }}</label>
              <input 
                id="emailAddress"
                type="email"
                pInputText
                [(ngModel)]="userForm.emailAddress"
                name="emailAddress"
                required
                class="w-full">
            </div>

            <div class="form-group">
              <label for="password">{{ editingUser ? ('admin.users.new_password_optional' | translate) : ('admin.users.password_required' | translate) }}</label>
              <input 
                id="password"
                type="password"
                pInputText
                [(ngModel)]="userForm.password"
                name="password"
                [required]="!editingUser"
                class="w-full">
            </div>

            <div class="form-group">
              <label for="personalIdentificationNumber">{{ 'admin.users.oib_label' | translate }}</label>
              <input 
                id="personalIdentificationNumber"
                type="text"
                pInputText
                [(ngModel)]="userForm.personalIdentificationNumber"
                name="personalIdentificationNumber"
                class="w-full">
            </div>

            <div class="dialog-actions">
              <p-button 
                [label]="'common.cancel' | translate"
                type="button"
                severity="secondary"
                [outlined]="true"
                (onClick)="closeUserDialog()">
              </p-button>
              <p-button 
                [label]="'common.save' | translate"
                type="submit"
                [style]="{'background-color': 'var(--primary-color)', 'border-color': 'var(--primary-color)'}">
              </p-button>
            </div>
          </form>
        </div>
      </p-dialog>

      <!-- Role Management Dialog -->
      <p-dialog 
        [header]="'admin.users.manage_user_roles' | translate"
        [(visible)]="showRoleDialog" 
        [modal]="true"
        [style]="{width: '800px'}"
        [closable]="true"
        [draggable]="false"
        styleClass="role-dialog">

        <div class="role-dialog-content" *ngIf="selectedUserForRoles">
          <!-- User Info Header -->
          <div class="role-user-header">
            <div class="role-user-avatar">
              {{ getUserInitials(selectedUserForRoles) }}
            </div>
            <div class="role-user-info">
              <h3>{{ selectedUserForRoles.fullName || (selectedUserForRoles.firstName + ' ' + selectedUserForRoles.lastName) }}</h3>
              <p>{{ selectedUserForRoles.emailAddress }}</p>
            </div>
          </div>

          <!-- Role Cards -->
          <div class="role-cards-container">
            <!-- Administrator Role -->
            <div class="role-card" [class.role-assigned]="hasRole(selectedUserForRoles, 'Administrator')">
              <div class="role-card-header">
                <div class="role-icon admin-icon">
                  <i class="pi pi-shield"></i>
                </div>
                <div class="role-details">
                  <h4>{{ 'roles.administrator' | translate }}</h4>
                  <p>{{ 'roles.administrator_description' | translate }}</p>
                  <div class="role-status" *ngIf="hasRole(selectedUserForRoles, 'Administrator')">
                    <p-badge [value]="'common.assigned' | translate" severity="success"></p-badge>
                  </div>
                </div>
                <div class="role-actions">
                  <p-button 
                    [label]="hasRole(selectedUserForRoles, 'Administrator') ? ('common.already_assigned' | translate) : ('admin.users.assign_administrator' | translate)"
                    size="small"
                    [style]="{'background-color': '#dc3545', 'border-color': '#dc3545'}"
                    (onClick)="assignAdministratorRole()"
                    [loading]="assigningRole === 'administrator'"
                    [disabled]="hasRole(selectedUserForRoles, 'Administrator')">
                  </p-button>
                </div>
              </div>
            </div>

            <!-- Internship Supervisor Role -->
            <div class="role-card" [class.role-assigned]="hasRole(selectedUserForRoles, 'InternshipSupervisor')">
              <div class="role-card-header">
                <div class="role-icon supervisor-icon">
                  <i class="pi pi-graduation-cap"></i>
                </div>
                <div class="role-details">
                  <h4>{{ 'roles.supervisor' | translate }}</h4>
                  <p>{{ 'roles.supervisor_description' | translate }}</p>
                  <div class="role-status" *ngIf="hasRole(selectedUserForRoles, 'InternshipSupervisor')">
                    <p-badge [value]="'common.assigned' | translate" severity="success"></p-badge>
                    <small class="role-detail">
                      {{ 'admin.users.academic_degree' | translate }}: {{ getRole(selectedUserForRoles, 'InternshipSupervisor')?.academicDegreeAbbreviation }}
                    </small>
                  </div>
                </div>
                <div class="role-actions">
                  <p-button 
                    [label]="hasRole(selectedUserForRoles, 'InternshipSupervisor') ? ('common.already_assigned' | translate) : ('admin.users.assign_supervisor' | translate)"
                    size="small"
                    [style]="{'background-color': '#fd7e14', 'border-color': '#fd7e14'}"
                    (onClick)="showSupervisorRoleForm = !showSupervisorRoleForm"
                    [disabled]="hasRole(selectedUserForRoles, 'InternshipSupervisor')">
                  </p-button>
                </div>
              </div>
              
              <!-- Supervisor Role Form -->
              <div class="role-form" *ngIf="showSupervisorRoleForm">
                <div class="form-group">
                  <label for="academicDegree">{{ 'admin.users.academic_degree_abbreviation' | translate }} *</label>
                  <input 
                    id="academicDegree"
                    type="text"
                    pInputText
                    [(ngModel)]="supervisorRoleForm.academicDegreeAbbreviation"
                    [placeholder]="'admin.users.academic_degree_placeholder' | translate"
                    class="w-full">
                </div>
                <div class="form-actions">
                  <p-button 
                    [label]="'common.cancel' | translate"
                    severity="secondary"
                    [outlined]="true"
                    size="small"
                    (onClick)="cancelSupervisorRoleForm()">
                  </p-button>
                  <p-button 
                    [label]="'common.save' | translate"
                    size="small"
                    [style]="{'background-color': '#fd7e14', 'border-color': '#fd7e14'}"
                    (onClick)="assignSupervisorRole()"
                    [loading]="assigningRole === 'supervisor'"
                    [disabled]="!supervisorRoleForm.academicDegreeAbbreviation">
                  </p-button>
                </div>
              </div>
            </div>

            <!-- Mentor Role -->
            <div class="role-card" [class.role-assigned]="hasRole(selectedUserForRoles, 'Mentor')">
              <div class="role-card-header">
                <div class="role-icon mentor-icon">
                  <i class="pi pi-users"></i>
                </div>
                <div class="role-details">
                  <h4>{{ 'roles.mentor' | translate }}</h4>
                  <p>{{ 'roles.mentor_description' | translate }}</p>
                  <div class="role-status" *ngIf="hasRole(selectedUserForRoles, 'Mentor')">
                    <p-badge [value]="'common.assigned' | translate" severity="success"></p-badge>
                    <small class="role-detail">
                      {{ 'admin.users.internship_provider' | translate }}: {{ getRole(selectedUserForRoles, 'Mentor')?.internshipProviderName }}
                    </small>
                  </div>
                </div>
                <div class="role-actions">
                  <p-button 
                    [label]="hasRole(selectedUserForRoles, 'Mentor') ? ('common.already_assigned' | translate) : ('admin.users.assign_mentor' | translate)"
                    size="small"
                    [style]="{'background-color': '#198754', 'border-color': '#198754'}"
                    (onClick)="showMentorRoleForm = !showMentorRoleForm; loadInternshipProviders()"
                    [disabled]="hasRole(selectedUserForRoles, 'Mentor')">
                  </p-button>
                </div>
              </div>
              
              <!-- Mentor Role Form -->
              <div class="role-form" *ngIf="showMentorRoleForm">
                <div class="form-group">
                  <label for="internshipProvider">{{ 'admin.users.internship_provider' | translate }} *</label>
                  <p-select 
                    [options]="internshipProviders" 
                    [(ngModel)]="mentorRoleForm.internshipProviderId"
                    optionLabel="name" 
                    optionValue="id"
                    [placeholder]="'admin.users.select_provider' | translate"
                    class="w-full"
                    [loading]="loadingProviders">
                  </p-select>
                </div>
                <div class="form-actions">
                  <p-button 
                    [label]="'common.cancel' | translate"
                    severity="secondary"
                    [outlined]="true"
                    size="small"
                    (onClick)="cancelMentorRoleForm()">
                  </p-button>
                  <p-button 
                    [label]="'common.save' | translate"
                    size="small"
                    [style]="{'background-color': '#198754', 'border-color': '#198754'}"
                    (onClick)="assignMentorRole()"
                    [loading]="assigningRole === 'mentor'"
                    [disabled]="!mentorRoleForm.internshipProviderId">
                  </p-button>
                </div>
              </div>
            </div>
          </div>

          <div class="role-dialog-footer">
            <p-button 
              [label]="'common.close' | translate"
              severity="secondary"
              [outlined]="true"
              (onClick)="closeRoleDialog()">
            </p-button>
          </div>
        </div>
      </p-dialog>
    </div>
    
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .page-container {
      padding: 2rem 3rem;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .search-section {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .search-container {
      position: relative;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      font-size: 0.9rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    /* Table Styling */
    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: #f8f9fa;
      border: none;
      border-bottom: 2px solid #e9ecef;
      color: var(--primary-color);
      font-weight: 600;
      padding: 1rem;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 1rem;
      border: none;
      border-bottom: 1px solid #f1f3f4;
    }

    ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: #f8f9fa;
    }

    .user-cell {
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

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .action-btn {
      min-width: auto !important;
      width: 2rem !important;
      height: 2rem !important;
    }

    ::ng-deep .edit-btn .p-button {
      color: var(--primary-color);
    }

    ::ng-deep .roles-btn .p-button {
      color: #6f42c1;
    }

    /* Dialog Styling */
    ::ng-deep .user-dialog .p-dialog-header {
      background: var(--primary-color);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .dialog-content {
      padding: 1rem 0;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .text-center {
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }

    .w-full {
      width: 100%;
    }

    /* PrimeNG Component Overrides */
    ::ng-deep .p-inputtext:enabled:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.1rem rgba(21, 50, 76, 0.2);
    }

    /* Role Dialog Styles */
    ::ng-deep .role-dialog .p-dialog-header {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .role-dialog-content {
      padding: 1rem 0;
    }

    .role-user-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .role-user-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      color: white;
      flex-shrink: 0;
    }

    .role-user-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    .role-user-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .role-cards-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .role-card {
      border: 1px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }

    .role-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .role-card.role-assigned {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-color: #198754;
    }

    .role-card.role-assigned .role-card-header {
      opacity: 0.9;
    }

    .role-card-header {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      gap: 1rem;
    }

    .role-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: white;
      flex-shrink: 0;
    }

    .admin-icon {
      background: linear-gradient(135deg, #dc3545, #c82333);
    }

    .supervisor-icon {
      background: linear-gradient(135deg, #fd7e14, #e8690b);
    }

    .mentor-icon {
      background: linear-gradient(135deg, #198754, #157347);
    }

    .role-details {
      flex: 1;
    }

    .role-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .role-details p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .role-actions {
      flex-shrink: 0;
    }

    .role-status {
      margin-top: 0.5rem;
    }

    .role-detail {
      display: block;
      margin-top: 0.25rem;
      color: #6c757d;
      font-style: italic;
    }

    .role-form {
      padding: 1rem 1.5rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .role-form .form-group {
      margin-bottom: 1rem;
    }

    .role-form .form-group:last-child {
      margin-bottom: 0;
    }

    .role-form label {
      display: block;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .role-dialog-footer {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .role-card-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .role-details {
        text-align: center;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  loading = false;
  searchText = '';

  // Dialog properties
  showUserDialog = false;
  editingUser: UserDto | null = null;

  // Form data
  userForm: Partial<CreateUserRequest> = {
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    personalIdentificationNumber: ''
  };

  // Role management properties
  showRoleDialog = false;
  selectedUserForRoles: UserDto | null = null;
  showSupervisorRoleForm = false;
  showMentorRoleForm = false;
  assigningRole: string | null = null;
  
  // Role form data
  supervisorRoleForm = {
    academicDegreeAbbreviation: ''
  };
  
  mentorRoleForm = {
    internshipProviderId: ''
  };

  // Internship providers for mentor role
  internshipProviders: InternshipProvider[] = [];
  loadingProviders = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.initializeLanguage();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        // The endpoint now includes roles, so we can use the data directly
        this.users = response.result;
        this.filterUsers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.fullName || `${user.firstName} ${user.lastName}`).toLowerCase().includes(searchLower) ||
        user.emailAddress.toLowerCase().includes(searchLower) ||
        (user.personalIdentificationNumber && user.personalIdentificationNumber.toLowerCase().includes(searchLower))
      );
    }
  }

  openUserDialog(): void {
    this.editingUser = null;
    this.userForm = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      password: '',
      personalIdentificationNumber: ''
    };
    this.showUserDialog = true;
  }

  editUser(user: UserDto): void {
    this.editingUser = user;
    this.userForm = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      emailAddress: user.emailAddress,
      password: '', // Always empty for editing
      personalIdentificationNumber: user.personalIdentificationNumber || ''
    };
    this.showUserDialog = true;
  }

  closeUserDialog(): void {
    this.showUserDialog = false;
    this.editingUser = null;
  }

  saveUser(): void {
    if (!this.userForm.firstName || !this.userForm.lastName || !this.userForm.emailAddress) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Molimo unesite sve obavezne podatke.'
      });
      return;
    }

    if (!this.editingUser && !this.userForm.password) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translationService.instant('common.warning'),
        detail: this.translationService.instant('admin.users.password_required_new_users')
      });
      return;
    }

    if (this.editingUser) {
      // Update existing user
      const updateRequest: UpdateUserRequest = {
        id: this.editingUser.id,
        firstName: this.userForm.firstName!,
        lastName: this.userForm.lastName!,
        emailAddress: this.userForm.emailAddress!,
        password: this.userForm.password || undefined,
        personalIdentificationNumber: this.userForm.personalIdentificationNumber || undefined
      };
      
      this.userService.updateUser(updateRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('admin.users.user_updated')
          });
          this.loadUsers();
          this.closeUserDialog();
        }
      });
    } else {
      // Create new user
      const createRequest: CreateUserRequest = {
        firstName: this.userForm.firstName!,
        lastName: this.userForm.lastName!,
        emailAddress: this.userForm.emailAddress!,
        password: this.userForm.password!,
        personalIdentificationNumber: this.userForm.personalIdentificationNumber || undefined
      };
      
      this.userService.createUser(createRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translationService.instant('common.success'),
            detail: this.translationService.instant('admin.users.user_created')
          });
          this.loadUsers();
          this.closeUserDialog();
        }
      });
    }
  }

  manageUserRoles(user: UserDto): void {
    this.selectedUserForRoles = user;
    this.resetRoleForms();
    this.showRoleDialog = true;
    
    // Load detailed user info with roles
    this.loadUserWithRoles(user.id);
  }

  private loadUserWithRoles(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        if (this.selectedUserForRoles) {
          // Update the selected user with role information
          this.selectedUserForRoles = { ...this.selectedUserForRoles, roles: response.result.roles };
        }
      }
    });
  }

  // Helper methods to check user roles
  hasRole(user: UserDto | null, roleType: string): boolean {
    return user?.roles?.some(role => role.roleType === roleType && role.active) || false;
  }

  getRole(user: UserDto | null, roleType: string): UserRoleDto | null {
    return user?.roles?.find(role => role.roleType === roleType && role.active) || null;
  }

  closeRoleDialog(): void {
    this.showRoleDialog = false;
    this.selectedUserForRoles = null;
    this.resetRoleForms();
  }

  private resetRoleForms(): void {
    this.showSupervisorRoleForm = false;
    this.showMentorRoleForm = false;
    this.assigningRole = null;
    this.supervisorRoleForm.academicDegreeAbbreviation = '';
    this.mentorRoleForm.internshipProviderId = '';
  }

  // Administrator Role
  assignAdministratorRole(): void {
    if (!this.selectedUserForRoles) return;

    this.assigningRole = 'administrator';
    const request: SetAdministratorRoleRequest = {
      userId: this.selectedUserForRoles.id
    };

    this.userService.setAdministratorRole(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('admin.users.admin_role_assigned')
        });
        this.assigningRole = null;
        this.closeRoleDialog();
      },
      error: () => {
        this.assigningRole = null;
      }
    });
  }

  // Supervisor Role
  cancelSupervisorRoleForm(): void {
    this.showSupervisorRoleForm = false;
    this.supervisorRoleForm.academicDegreeAbbreviation = '';
  }

  assignSupervisorRole(): void {
    if (!this.selectedUserForRoles || !this.supervisorRoleForm.academicDegreeAbbreviation) return;

    this.assigningRole = 'supervisor';
    const request: SetInternshipSupervisorRoleRequest = {
      userId: this.selectedUserForRoles.id,
      academicDegreeAbbreviation: this.supervisorRoleForm.academicDegreeAbbreviation
    };

    this.userService.setInternshipSupervisorRole(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('admin.users.supervisor_role_assigned')
        });
        this.assigningRole = null;
        this.closeRoleDialog();
      },
      error: () => {
        this.assigningRole = null;
      }
    });
  }

  // Mentor Role
  loadInternshipProviders(): void {
    if (this.internshipProviders.length > 0) return; // Already loaded

    this.loadingProviders = true;
    this.userService.getInternshipProviders().subscribe({
      next: (response) => {
        this.internshipProviders = response.result;
        this.loadingProviders = false;
      },
      error: () => {
        this.loadingProviders = false;
      }
    });
  }

  cancelMentorRoleForm(): void {
    this.showMentorRoleForm = false;
    this.mentorRoleForm.internshipProviderId = '';
  }

  assignMentorRole(): void {
    if (!this.selectedUserForRoles || !this.mentorRoleForm.internshipProviderId) return;

    this.assigningRole = 'mentor';
    const request: SetMentorRoleRequest = {
      userId: this.selectedUserForRoles.id,
      internshipProviderId: this.mentorRoleForm.internshipProviderId
    };

    this.userService.setMentorRole(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translationService.instant('common.success'),
          detail: this.translationService.instant('admin.users.mentor_role_assigned')
        });
        this.assigningRole = null;
        this.closeRoleDialog();
      },
      error: () => {
        this.assigningRole = null;
      }
    });
  }

  getUserInitials(user: UserDto): string {
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getRoleDisplayText(roleType: string): string {
    switch (roleType) {
      case 'Administrator':
        return 'Admin';
      case 'InternshipSupervisor':
        return 'Voditelj';
      case 'Mentor':
        return 'Mentor';
      case 'Student':
        return 'Student';
      default:
        return roleType;
    }
  }

  getRoleIcon(roleType: string): string {
    switch (roleType) {
      case 'Administrator':
        return 'pi pi-shield';
      case 'InternshipSupervisor':
        return 'pi pi-graduation-cap';
      case 'Mentor':
        return 'pi pi-users';
      case 'Student':
        return 'pi pi-book';
      default:
        return 'pi pi-user';
    }
  }

  getRoleSeverity(roleType: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (roleType) {
      case 'Administrator':
        return 'danger';
      case 'InternshipSupervisor':
        return 'warn';
      case 'Mentor':
        return 'success';
      case 'Student':
        return 'info';
      default:
        return 'secondary';
    }
  }
} 